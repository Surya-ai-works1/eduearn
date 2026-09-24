-- ==============================================================================
-- 🚀 EDUEARN V1 DEFAULT PRICING & CAREER PACKAGES SEED DATA MIGRATION
-- Created: 2026-09-16
-- Non-Destructive, Idempotent Seed Migration (ON CONFLICT DO NOTHING)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Seed Career Packages
-- ------------------------------------------------------------------------------
INSERT INTO public.career_packages (title, slug, description, category, level, base_price, selling_price, duration_months, total_live_classes, status) VALUES
  ('CSE Starter', 'cse-starter', 'Master C, Python, Data Structures & Web Fundamentals.', 'Technology & Programming', 'Beginner', 6999, 5999, 3, 48, 'published'),
  ('Full Stack Career', 'full-stack-career', 'Complete Web Engineering from HTML/CSS to React, Node, and Next.js.', 'Technology & Programming', 'All Levels', 9999, 8499, 6, 96, 'published'),
  ('AI/ML Career', 'ai-ml-career', 'From Python & Data Science to PyTorch Deep Learning and Model Deployment.', 'AI & Data Science', 'Intermediate', 14999, 12499, 6, 96, 'published'),
  ('GenAI + Agentic AI', 'genai-agentic-ai', 'Build Production Autonomous LLM Agents, RAG Pipelines, and CrewAI Workflows.', 'AI & Data Science', 'Advanced', 21999, 18999, 6, 96, 'published'),
  ('ECE Career Accelerator', 'ece-career-accelerator', 'Complete ECE track from Microcontrollers to Embedded C, IoT, and Edge AI.', 'Engineering & Electronics', 'All Levels', 17999, 14999, 6, 96, 'published'),
  ('Embedded + IoT', 'embedded-iot', 'Master ESP32, STM32, Bare Metal C, and IoT Cloud Protocols.', 'Engineering & Electronics', 'Intermediate', 11999, 9999, 4, 64, 'published'),
  ('Robotics Engineer', 'robotics-engineer', 'ROS, Arduino, Servo Actuators, Sensor Fusion, and Autonomous Motion Control.', 'Engineering & Electronics', 'All Levels', 12999, 10999, 4, 64, 'published'),
  ('VLSI Engineer', 'vlsi-engineer', 'Digital Electronics, Verilog HDL, FPGA Prototyping, and CMOS VLSI Design.', 'Engineering & Electronics', 'Advanced', 13999, 11999, 5, 80, 'published'),
  ('EEE Career Accelerator', 'eee-career-accelerator', 'Power Electronics, Electrical Machines, EV BMS, Renewable Energy & Industrial PLC.', 'Engineering & Electronics', 'All Levels', 16999, 13999, 6, 96, 'published'),
  ('EV & BMS Engineer', 'ev-bms-engineer', 'Electric Vehicle Powertrains, Battery Management Systems, Thermal & CAN Bus.', 'Engineering & Electronics', 'Advanced', 13999, 11999, 4, 64, 'published'),
  ('Industrial Automation', 'industrial-automation', 'PLC Programming, SCADA Systems, HMI Interfaces & Industrial Robotics.', 'Engineering & Electronics', 'Intermediate', 11999, 9999, 4, 64, 'published')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. Seed Practical Projects (Learning Fees & Hardware Costs Kept Separate)
-- ------------------------------------------------------------------------------
INSERT INTO public.projects (title, slug, description, category, subcategory, difficulty, duration, total_sessions, learning_fee, hardware_required, hardware_cost, bom, skills, learning_outcomes, status, approval_status) VALUES
  (
    'ESP32 Smart Home IoT Gateway', 'esp32-smart-home-gateway', 
    'Build a Wi-Fi enabled environmental monitoring node with MQTT and Grafana dashboard.',
    'Engineering & Electronics', 'ECE & Embedded', 'Beginner', '2 Weeks', 4,
    499, true, 1299,
    '[{"item": "ESP32 DevKit", "cost": 450}, {"item": "DHT22 Sensor", "cost": 250}, {"item": "OLED Display", "cost": 300}, {"item": "Jumper Wires & Breadboard", "cost": 299}]'::JSONB,
    ARRAY['ESP32', 'C++', 'MQTT', 'IoT'], ARRAY['Microcontroller Programming', 'Sensor Interfacing', 'Cloud Dashboarding'],
    'published', 'approved'
  ),
  (
    'Autonomous 4WD Obstacle Avoiding Robot', 'autonomous-4wd-robot',
    'Assemble and program an Arduino-powered mobile robot with Ultrasonic Sensor and Motor Driver.',
    'Engineering & Electronics', 'Robotics & IoT', 'Intermediate', '3 Weeks', 6,
    899, true, 2499,
    '[{"item": "Arduino Uno", "cost": 650}, {"item": "L298N Motor Driver", "cost": 350}, {"item": "4WD Chassis & Motors", "cost": 999}, {"item": "HC-SR04 Ultrasonic", "cost": 150}, {"item": "Battery Pack", "cost": 350}]'::JSONB,
    ARRAY['Arduino', 'Robotics', 'C++', 'Motor Control'], ARRAY['Robotics Hardware Assembly', 'Sensor Fusion', 'Closed-loop Feedback'],
    'published', 'approved'
  ),
  (
    'EV Battery Management System (BMS) Monitor', 'ev-bms-monitor',
    'Design a multi-cell Lithium-ion battery monitoring circuit with cell balancing & CAN Bus telemetry.',
    'Engineering & Electronics', 'EEE & Power', 'Advanced', '4 Weeks', 8,
    1499, true, 3499,
    '[{"item": "BMS Controller IC", "cost": 850}, {"item": "4S Li-ion Pack", "cost": 1400}, {"item": "CAN Transceiver Module", "cost": 450}, {"item": "Current Sensing Shunt", "cost": 799}]'::JSONB,
    ARRAY['Power Electronics', 'BMS', 'EV', 'CAN Bus'], ARRAY['Cell Balancing Circuits', 'Thermal Cutoff Logic', 'CAN Network Diagnostics'],
    'published', 'approved'
  ),
  (
    'FPGA Digital Clock & Timer Core', 'fpga-digital-clock',
    'Implement a Verilog HDL digital clock with 7-segment display driver on Spartan-6 FPGA board.',
    'Engineering & Electronics', 'VLSI', 'Intermediate', '3 Weeks', 6,
    1099, true, 2999,
    '[{"item": "FPGA Development Board", "cost": 2499}, {"item": "PMOD Display Module", "cost": 500}]'::JSONB,
    ARRAY['Verilog', 'VLSI', 'FPGA', 'Digital Logic'], ARRAY['Hardware Description Language', 'Synthesis & Placement', 'Timing Analysis'],
    'published', 'approved'
  )
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Seed Promotional Discounts
-- ------------------------------------------------------------------------------
INSERT INTO public.discounts (code, type, discount_mode, percentage, fixed_amount, max_discount, minimum_purchase, usage_limit, active, start_at, end_at) VALUES
  ('EDUEARN10', 'LAUNCH', 'percentage', 10, 0, 500, 499, 1000, true, now(), now() + interval '1 year'),
  ('WELCOME200', 'FIRST_PURCHASE', 'fixed', 0, 200, 200, 999, 500, true, now(), now() + interval '1 year'),
  ('ENGINEER15', 'STUDENT', 'percentage', 15, 0, 1500, 1999, 500, true, now(), now() + interval '1 year')
ON CONFLICT (code) DO NOTHING;
