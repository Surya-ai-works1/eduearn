import { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

export function useSupabaseChat(roomType: "live_class" | "course" | "private", targetId: string) {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!user || !targetId) return;

    let isMounted = true;

    async function initChat() {
      try {
        setIsLoading(true);
        
        // 1. Find or create the room
        let room: any = null;

        if (roomType === "live_class") {
          const { data: rooms, error: roomErr } = await supabase
            .from("chat_rooms")
            .select("id")
            .eq("live_class_id", targetId)
            .limit(1);

          if (roomErr) throw roomErr;

          if (rooms && rooms.length > 0) {
            room = rooms[0];
          } else {
            // Create class room
            const { data: newRoom, error: newRoomErr } = await supabase
              .from("chat_rooms")
              .insert({
                type: "live_class",
                live_class_id: targetId,
                name: `Live Class Chat ${targetId}`
              })
              .select("id")
              .single();

            if (newRoomErr) throw newRoomErr;
            room = newRoom;
          }
        } else if (roomType === "course") {
          const { data: rooms, error: roomErr } = await supabase
            .from("chat_rooms")
            .select("id")
            .eq("course_id", targetId)
            .limit(1);

          if (roomErr) throw roomErr;

          if (rooms && rooms.length > 0) {
            room = rooms[0];
          } else {
            // Create course room
            const { data: newRoom, error: newRoomErr } = await supabase
              .from("chat_rooms")
              .insert({
                type: "course",
                course_id: targetId,
                name: `Course Discussion ${targetId}`
              })
              .select("id")
              .single();

            if (newRoomErr) throw newRoomErr;
            room = newRoom;
          }
        }

        if (!room || !isMounted || !user) return;
        setRoomId(room.id);

        // 2. Ensure participant record exists
        const { error: partErr } = await supabase
          .from("chat_participants")
          .upsert(
            { room_id: room.id, user_id: user.id },
            { onConflict: "room_id,user_id" }
          );

        if (partErr) console.warn("Failed to join chat participant:", partErr);

        // 3. Load initial messages
        const { data: msgs, error: msgsErr } = await supabase
          .from("messages")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true });

        if (msgsErr) throw msgsErr;

        // Fetch sender profile details to display names
        const senderIds = Array.from(new Set(msgs.map((m: any) => m.sender_id)));
        let profiles: any[] = [];
        if (senderIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, role")
            .in("id", senderIds);
          profiles = profs || [];
        }

        const enrichedMsgs = msgs.map((m: any) => {
          const prof = profiles.find((p: any) => p.id === m.sender_id);
          return {
            ...m,
            sender_name: prof?.full_name || "User",
            sender_role: prof?.role || "learner",
          };
        });

        if (isMounted) {
          setMessages(enrichedMsgs);
          setIsLoading(false);
        }

        // 4. Subscribe to realtime channel
        const channel = supabase
          .channel(`room-${room.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `room_id=eq.${room.id}`,
            },
            async (payload: any) => {
              const newMsg = payload.new;
              
              // Enrich single incoming message with sender name
              const { data: prof } = await supabase
                .from("profiles")
                .select("full_name, role")
                .eq("id", newMsg.sender_id)
                .single();

              const enriched = {
                ...newMsg,
                sender_name: prof?.full_name || "User",
                sender_role: prof?.role || "learner",
              };

              if (isMounted) {
                setMessages((prev) => {
                  if (prev.some(m => m.id === enriched.id)) return prev;
                  return [...prev, enriched];
                });
              }
            }
          )
          .subscribe();

        subscriptionRef.current = channel;

      } catch (err) {
        console.error("Failed to load realtime chat room:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [roomType, targetId, user]);

  /**
   * Send a new message to the active chat room
   */
  const sendMessage = async (content: string, messageType = "text", fileUrl?: string) => {
    if (!roomId || !user) return false;
    try {
      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
        file_url: fileUrl,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  return {
    roomId,
    messages,
    isLoading,
    sendMessage,
  };
}
