"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Star, Eye, ArrowUp, ArrowDown, FolderKanban, Sliders } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { MarketplaceService, MarketplaceCategory } from "../../../../../features/payments/services/marketplaceService";

interface CategoriesTabProps {
  logAuditAction: (actionStr: string) => void;
}

type SubViewType = "syllabus" | "metadata";
type EntityType = "languages" | "levels" | "tags" | "difficulties" | "certificates" | "course_types" | "live_class_types";

export default function CategoriesTab({ logAuditAction }: CategoriesTabProps) {
  // Navigation
  const [activeSubView, setActiveSubView] = useState<SubViewType>("syllabus");

  // --- SYLLABUS ACCORDION STATE ---
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  
  const [activeAddSubCatId, setActiveAddSubCatId] = useState<string | null>(null);
  const [newSubCatName, setNewSubCatName] = useState("");
  
  const [activeAddSkillKey, setActiveAddSkillKey] = useState<string | null>(null); // format: "catId-subcatName"
  const [newSkillName, setNewSkillName] = useState("");

  // --- OTHER MASTER DATA ENTITIES STATE ---
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("languages");
  const [metadataItems, setMetadataItems] = useState<string[]>([]);
  const [newMetadataValue, setNewMetadataValue] = useState("");
  const [editingMetadataIndex, setEditingMetadataIndex] = useState<number | null>(null);
  const [editingMetadataValue, setEditingMetadataValue] = useState("");

  const loadCategories = () => {
    setCategories(MarketplaceService.getCategories());
  };

  const loadMetadata = () => {
    switch (selectedEntity) {
      case "languages":
        setMetadataItems(MarketplaceService.getLanguages());
        break;
      case "levels":
        setMetadataItems(MarketplaceService.getLevels());
        break;
      case "tags":
        setMetadataItems(MarketplaceService.getCourseTags());
        break;
      case "difficulties":
        setMetadataItems(MarketplaceService.getDifficulties());
        break;
      case "certificates":
        setMetadataItems(MarketplaceService.getCertificates());
        break;
      case "course_types":
        setMetadataItems(MarketplaceService.getCourseTypes());
        break;
      case "live_class_types":
        setMetadataItems(MarketplaceService.getLiveClassTypes());
        break;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntity]);

  // --- SYLLABUS METRICS & ACTIONS ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    MarketplaceService.addCategory(newCatName.trim());
    logAuditAction(`Created course category node: ${newCatName.trim()}`);
    setNewCatName("");
    loadCategories();
    toast.success("Category created successfully.");
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? All subcategories and skills will be lost.`)) {
      MarketplaceService.deleteCategory(id);
      logAuditAction(`Deleted course category node: ${name}`);
      loadCategories();
      toast.success("Category deleted.");
    }
  };

  const handleRenameCategory = (id: string) => {
    if (!editingCatName.trim()) return;
    MarketplaceService.renameCategory(id, editingCatName.trim());
    logAuditAction(`Renamed category to: ${editingCatName.trim()}`);
    setEditingCatId(null);
    setEditingCatName("");
    loadCategories();
    toast.success("Category renamed.");
  };

  const handleToggleCategory = (id: string, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === "Enabled" ? false : true;
    MarketplaceService.toggleCategory(id, nextStatus);
    logAuditAction(`Toggled category ${name} status to ${nextStatus ? "Enabled" : "Disabled"}`);
    loadCategories();
    toast.success(`Category ${nextStatus ? "Enabled" : "Disabled"}.`);
  };

  const handleAddSubcategory = (catId: string) => {
    if (!newSubCatName.trim()) return;
    MarketplaceService.addSubcategory(catId, newSubCatName.trim());
    logAuditAction(`Added subcategory "${newSubCatName.trim()}" to category ${catId}`);
    setNewSubCatName("");
    setActiveAddSubCatId(null);
    loadCategories();
    toast.success("Subcategory added successfully.");
  };

  const handleDeleteSubcategory = (catId: string, subcatName: string) => {
    MarketplaceService.deleteSubcategory(catId, subcatName);
    logAuditAction(`Deleted subcategory "${subcatName}" from category ${catId}`);
    loadCategories();
    toast.success("Subcategory deleted.");
  };

  const handleAddSkill = (catId: string, subcatName: string) => {
    if (!newSkillName.trim()) return;
    MarketplaceService.addSkill(catId, subcatName, newSkillName.trim());
    logAuditAction(`Created skill nodes: ${newSkillName.trim()} under subcategory ${subcatName}`);
    setNewSkillName("");
    setActiveAddSkillKey(null);
    loadCategories();
    toast.success("Skill added.");
  };

  const handleDeleteSkill = (catId: string, subcatName: string, skillId: string, skillName: string) => {
    MarketplaceService.deleteSkill(catId, subcatName, skillId);
    logAuditAction(`Deleted skill node: ${skillName} under subcategory ${subcatName}`);
    loadCategories();
    toast.success("Skill deleted.");
  };

  const handleToggleSkillFeatured = (catId: string, subcatName: string, skillId: string, current: boolean) => {
    MarketplaceService.toggleSkillFeatured(catId, subcatName, skillId, !current);
    loadCategories();
    toast.success(`Skill featured state changed.`);
  };

  const handleToggleSkillHidden = (catId: string, subcatName: string, skillId: string, current: boolean) => {
    MarketplaceService.toggleSkillHidden(catId, subcatName, skillId, !current);
    loadCategories();
    toast.success(`Skill hidden state changed.`);
  };

  // --- OTHER MASTER DATA ACTIONS ---
  const saveMetadata = (updated: string[]) => {
    setMetadataItems(updated);
    switch (selectedEntity) {
      case "languages":
        MarketplaceService.saveLanguages(updated);
        break;
      case "levels":
        MarketplaceService.saveLevels(updated);
        break;
      case "tags":
        MarketplaceService.saveCourseTags(updated);
        break;
      case "difficulties":
        MarketplaceService.saveDifficulties(updated);
        break;
      case "certificates":
        MarketplaceService.saveCertificates(updated);
        break;
      case "course_types":
        MarketplaceService.saveCourseTypes(updated);
        break;
      case "live_class_types":
        MarketplaceService.saveLiveClassTypes(updated);
        break;
    }
  };

  const handleAddMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetadataValue.trim()) return;
    const updated = [...metadataItems, newMetadataValue.trim()];
    saveMetadata(updated);
    logAuditAction(`Added master metadata item to ${selectedEntity}: "${newMetadataValue.trim()}"`);
    setNewMetadataValue("");
    toast.success("Item added successfully.");
  };

  const handleDeleteMetadata = (index: number, val: string) => {
    if (confirm(`Are you sure you want to delete "${val}"?`)) {
      const updated = metadataItems.filter((_, i) => i !== index);
      saveMetadata(updated);
      logAuditAction(`Deleted master metadata item from ${selectedEntity}: "${val}"`);
      toast.success("Item deleted.");
    }
  };

  const handleRenameMetadata = (index: number) => {
    if (!editingMetadataValue.trim()) return;
    const updated = [...metadataItems];
    const oldVal = updated[index];
    updated[index] = editingMetadataValue.trim();
    saveMetadata(updated);
    logAuditAction(`Renamed master metadata item in ${selectedEntity} from "${oldVal}" to "${editingMetadataValue.trim()}"`);
    setEditingMetadataIndex(null);
    setEditingMetadataValue("");
    toast.success("Item updated.");
  };

  const handleMoveMetadata = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === metadataItems.length - 1) return;
    
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...metadataItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    saveMetadata(updated);
    logAuditAction(`Reordered master metadata items in ${selectedEntity}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      {/* SUB-VIEW NAVIGATION */}
      <div className="flex border-b border-border/40 pb-2 gap-2 select-none">
        <button
          onClick={() => setActiveSubView("syllabus")}
          className={`px-3.5 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeSubView === "syllabus"
              ? "bg-primary border-primary text-white shadow-soft"
              : "border-border text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <FolderKanban size={12} />
          <span>Syllabus Hierarchy Tree</span>
        </button>
        <button
          onClick={() => setActiveSubView("metadata")}
          className={`px-3.5 py-1.5 border rounded-button text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeSubView === "metadata"
              ? "bg-primary border-primary text-white shadow-soft"
              : "border-border text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Sliders size={12} />
          <span>Master Platform Tables</span>
        </button>
      </div>

      {/* VIEW 1: SYLLABUS ROADMAP TREE */}
      {activeSubView === "syllabus" && (
        <div className="space-y-6">
          <div className="select-none">
            <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
              Course Categories &amp; Skills Roadmap
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Design the subject categories, subcategories, and skill bubbles displayed on the Tutor Studio and Student Classroom.
            </p>
          </div>

          <Card className="p-4 border-border bg-card shadow-soft">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter new category name (e.g., Development, Design)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 h-9 rounded border border-border bg-muted/10 px-3 text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="h-9 gap-1 text-[11px] font-bold">
                <Plus size={14} /> Add Category
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="text-center py-10 border border-border/60 rounded-card text-xs text-muted-foreground/60">
                No categories defined. Use the input above to build one.
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="border border-border/60 bg-card rounded-card p-4 space-y-4 shadow-soft">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <div className="flex items-center gap-2">
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="h-8 rounded border border-border px-2 text-xs font-bold text-foreground bg-card"
                          />
                          <Button size="sm" onClick={() => handleRenameCategory(cat.id)} className="h-8 w-8 p-0">
                            <Check size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCatId(null)} className="h-8 w-8 p-0">
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-heading font-extrabold text-foreground">
                            📁 {cat.name}
                          </span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            cat.status === "Enabled" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                          }`}>
                            {cat.status}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      {editingCatId !== cat.id && (
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleToggleCategory(cat.id, cat.status, cat.name)}
                        className="text-[9px] h-7 px-2"
                      >
                        {cat.status === "Enabled" ? "Disable" : "Enable"}
                      </Button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border rounded cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="pl-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">
                        Subcategories &amp; Skills Nodes
                      </span>
                      {activeAddSubCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 animate-fadeIn">
                          <input
                            type="text"
                            placeholder="Subcategory Name..."
                            value={newSubCatName}
                            onChange={(e) => setNewSubCatName(e.target.value)}
                            className="h-8 rounded border border-border px-2 text-[10px] text-foreground font-semibold bg-card"
                          />
                          <Button size="sm" onClick={() => handleAddSubcategory(cat.id)} className="h-8 text-[9px] px-2.5">
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setActiveAddSubCatId(null)} className="h-8 text-[9px] px-2">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => setActiveAddSubCatId(cat.id)} variant="ghost" size="sm" className="h-6 text-[9px] text-primary hover:bg-primary/5">
                          + Add Subcategory
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cat.subcategories.map((sub) => {
                        const skillKey = `${cat.id}-${sub.name}`;
                        return (
                          <div key={sub.name} className="border border-border/40 p-3 bg-muted/5 rounded-card flex flex-col gap-3">
                            <div className="flex items-center justify-between text-xs font-bold text-foreground select-none">
                              <span>📦 {sub.name}</span>
                              <div className="flex items-center gap-1.5">
                                {activeAddSkillKey === skillKey ? (
                                  <div className="flex items-center gap-1 animate-fadeIn">
                                    <input
                                      type="text"
                                      placeholder="Skill Name..."
                                      value={newSkillName}
                                      onChange={(e) => setNewSkillName(e.target.value)}
                                      className="h-7 rounded border border-border px-2 text-[9px] text-foreground font-semibold bg-card"
                                    />
                                    <Button size="sm" onClick={() => handleAddSkill(cat.id, sub.name)} className="h-7 px-2 text-[8px]">
                                      Add
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setActiveAddSkillKey(null)} className="h-7 px-1 text-[8px]">
                                      X
                                    </Button>
                                  </div>
                                ) : (
                                  <Button onClick={() => setActiveAddSkillKey(skillKey)} variant="ghost" size="sm" className="h-5 text-[8px] text-primary hover:bg-primary/5 px-1.5">
                                    + Skill
                                  </Button>
                                )}
                                <button
                                  onClick={() => handleDeleteSubcategory(cat.id, sub.name)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pl-2">
                              {sub.skills.length === 0 ? (
                                <span className="text-[8px] text-muted-foreground/60 font-medium">No skills yet.</span>
                              ) : (
                                sub.skills.map((sk) => (
                                  <div
                                    key={sk.id}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-semibold transition-all ${
                                      sk.isHidden
                                        ? "bg-slate-500/10 text-muted-foreground border-slate-500/20"
                                        : sk.isFeatured
                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/35"
                                        : "bg-primary/5 text-primary border-primary/20"
                                    }`}
                                  >
                                    <span>{sk.name}</span>
                                    <div className="flex items-center gap-1 border-l border-border/30 pl-1 shrink-0 select-none">
                                      <button
                                        onClick={() => handleToggleSkillFeatured(cat.id, sub.name, sk.id, sk.isFeatured)}
                                        className={`hover:scale-110 transition-transform ${sk.isFeatured ? "text-amber-500" : "text-muted-foreground/50"}`}
                                      >
                                        <Star size={8} fill={sk.isFeatured ? "currentColor" : "none"} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleSkillHidden(cat.id, sub.name, sk.id, sk.isHidden)}
                                        className="hover:scale-110 text-muted-foreground/50 hover:text-foreground transition-colors"
                                      >
                                        {sk.isHidden ? <Star size={8} className="text-red-400" /> : <Eye size={8} />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSkill(cat.id, sub.name, sk.id, sk.name)}
                                        className="hover:scale-110 text-muted-foreground/50 hover:text-rose-500 transition-colors ml-0.5"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: OTHER MASTER METADATA TABLES */}
      {activeSubView === "metadata" && (
        <div className="space-y-6">
          <div className="select-none">
            <h3 className="text-xs font-heading font-extrabold uppercase tracking-wide text-foreground">
              Master Platform Entity Configurations
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Control the dropdown arrays populated inside Tutor studio course creation forms and Student listings filters.
            </p>
          </div>

          {/* TABLE SELECTOR HEADER */}
          <Card className="p-4 border-border bg-card shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Select Master Data Table</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as any)}
                className="h-10 border border-border rounded-button bg-card px-3 text-xs font-semibold focus:outline-none"
              >
                <option value="languages">Languages</option>
                <option value="levels">Complexity Levels</option>
                <option value="tags">Course Tags</option>
                <option value="difficulties">Difficulty Scales</option>
                <option value="certificates">Certificate Templates</option>
                <option value="course_types">Course Formats/Types</option>
                <option value="live_class_types">Live Class Types</option>
              </select>
            </div>
          </Card>

          {/* ADD ITEM BLOCK */}
          <Card className="p-4 border-border bg-card shadow-soft">
            <form onSubmit={handleAddMetadata} className="flex gap-2">
              <input
                type="text"
                required
                placeholder={`Create new item for ${selectedEntity}...`}
                value={newMetadataValue}
                onChange={(e) => setNewMetadataValue(e.target.value)}
                className="flex-1 h-9 rounded border border-border bg-muted/10 px-3 text-xs font-semibold text-foreground focus:outline-none"
              />
              <Button type="submit" size="sm" className="h-9 gap-1 text-[11px] font-bold">
                <Plus size={14} /> Add Item
              </Button>
            </form>
          </Card>

          {/* METADATA ITEMS LIST TREE */}
          <Card className="p-5 border-border bg-card shadow-soft space-y-3.5 select-none">
            <h4 className="text-xs font-heading font-extrabold uppercase text-foreground border-b border-border/20 pb-2">
              Roster: {selectedEntity.replace("_", " ")} ({metadataItems.length} records)
            </h4>
            
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {metadataItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground/60">
                  No records defined. Add one above.
                </div>
              ) : (
                metadataItems.map((val, idx) => {
                  const isEditing = editingMetadataIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-border bg-card p-3 rounded-card text-xs flex items-center justify-between shadow-soft hover:border-primary/20 transition-all font-semibold"
                    >
                      <div className="flex items-center gap-3 flex-1 mr-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingMetadataValue}
                              onChange={(e) => setEditingMetadataValue(e.target.value)}
                              className="h-8 rounded border border-border px-2.5 text-xs text-foreground bg-card focus:outline-none w-full max-w-[200px]"
                            />
                            <Button size="sm" onClick={() => handleRenameMetadata(idx)} className="h-8 w-8 p-0">
                              <Check size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingMetadataIndex(null)} className="h-8 w-8 p-0">
                              <X size={12} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-foreground">{val}</span>
                        )}
                      </div>

                      {/* Controls and Actions */}
                      <div className="flex items-center gap-2 shrink-0 select-none">
                        <div className="flex gap-0.5 border border-border/50 rounded p-0.5 bg-muted/10">
                          <button
                            onClick={() => handleMoveMetadata(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            onClick={() => handleMoveMetadata(idx, "down")}
                            disabled={idx === metadataItems.length - 1}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>

                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingMetadataIndex(idx);
                              setEditingMetadataValue(val);
                            }}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={11} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteMetadata(idx, val)}
                          className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/20 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
