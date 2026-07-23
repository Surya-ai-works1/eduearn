# 🗄️ EduEarn - Database Schema

# Database

PostgreSQL

Backend

Supabase

Architecture

Relational Database

Normalization

3NF

Soft Delete Support

Audit Timestamps

UUID Primary Keys

---

# Core Tables

## Users

Stores authentication and profile information.

Fields

* id
* full_name
* email
* phone
* avatar
* role
* date_of_birth
* country
* state
* city
* bio
* created_at
* updated_at

---

## Learners

Stores learner-specific information.

Fields

* id
* user_id
* learning_goals
* enrolled_courses
* completed_courses
* certificates
* created_at

---

## Tutors

Stores tutor profiles.

Fields

* id
* user_id
* verification_status
* ai_assessment_score
* experience
* expertise
* earnings
* rating
* total_students
* total_courses
* approval_status
* created_at

---

## Categories

Examples

Technology

Business

Music

Dance

Photography

Cooking

Sports

Competitive Exams

Languages

Fitness

Arts

AI

---

## Courses

Fields

* id
* tutor_id
* category_id
* title
* description
* thumbnail
* price
* level
* language
* duration
* status
* rating
* created_at

---

## Lessons

Each course contains multiple lessons.

Fields

* id
* course_id
* title
* video_url
* notes
* duration
* lesson_order

---

## Enrollments

Stores purchased courses.

Fields

* learner_id
* course_id
* progress
* enrolled_at
* completed_at

---

## Live Classes

Fields

* tutor_id
* title
* schedule
* duration
* meeting_link
* status

---

## Assignments

Fields

* course_id
* title
* description
* deadline

---

## Quizzes

Fields

* course_id
* title
* total_marks

---

## Certificates

Fields

* learner_id
* course_id
* certificate_number
* issue_date
* qr_code

---

## Reviews

Fields

* learner_id
* course_id
* rating
* comment

---

## Wishlist

Fields

* learner_id
* course_id

---

## Payments

Fields

* learner_id
* course_id
* amount
* payment_method
* payment_status

---

## Tutor Earnings

Fields

* tutor_id
* total_earnings
* available_balance
* withdrawn_amount

---

## Withdrawal Requests

Fields

* tutor_id
* amount
* status
* approved_by

---

## Notifications

Fields

* receiver_id
* title
* message
* is_read

---

## Messages

Fields

* sender_id
* receiver_id
* message
* timestamp

---

## AI Assessments

Stores tutor assessment results.

Fields

* tutor_id
* score
* strengths
* weaknesses
* recommendation

---

## AI Chat History

Stores AI conversations.

Fields

* learner_id
* prompt
* response
* created_at

---

## Support Tickets

Fields

* user_id
* subject
* message
* status

---

## Blog Posts

Fields

* title
* slug
* content
* author
* published_at

---

# Relationships

User

↓

Learner

↓

Enrollments

↓

Courses

↓

Lessons

Tutor

↓

Courses

↓

Students

↓

Reviews

Payments

↓

Tutor Earnings

↓

Withdrawals

---

# Security

UUID IDs

Foreign Keys

Indexes

RLS Policies

Audit Logs

Soft Deletes

Secure Storage

---

# Goal

Design a scalable database capable of supporting millions of learners, tutors, courses, live classes, AI interactions, and financial transactions while maintaining high performance and data integrity.
