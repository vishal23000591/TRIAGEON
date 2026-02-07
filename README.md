# TRIAGEON

**ML-Driven Urgency-Aware Digital Health Triage System**

## Overview

TRIAGEON is an end-to-end, machine-learning–powered digital triage platform designed to identify medical risk early, classify patient urgency accurately, and guide patients toward appropriate care.
It focuses on **risk detection and prioritization**, not final diagnosis, ensuring safety, scalability, and real-world clinical usability.

The system is especially targeted toward **rural and semi-urban healthcare environments**, where delayed detection of serious conditions often leads to avoidable complications.

---

## Problem Statement

Healthcare systems frequently suffer from:

* Overcrowding by non-urgent cases
* Missed or delayed identification of high-risk patients
* Poor understanding of lab reports by patients
* Lack of structured urgency assessment

Critical conditions such as anemia, diabetes, hypertension, heart disease, and severe infections often go unnoticed until they become life-threatening.

TRIAGEON addresses this gap using ML-based risk prediction, explainable urgency scoring, and proactive care navigation.

---

## Core Objectives

* Early detection of disease risk using ML models
* Accurate urgency classification for triage
* Clear, explainable medical reasoning for patients
* Automated extraction of lab values using OCR
* Proactive clinic alerts for high-risk cases
* Scalable design suitable for real-world deployment

---

## System Architecture

### 1. Patient Data Intake Layer

* Symptom input (text, voice, checklists)
* Demographics (age, gender, pregnancy, known conditions)
* Vital signs (BP, pulse, temperature if available)
* Lab report upload (PDF or camera image)
* Eye image capture for hemoglobin estimation (AnemiAI)

### 2. OCR & Medical Data Extraction

* Optical Character Recognition for lab reports
* Structured extraction of hemoglobin, glucose, BP, cholesterol, ECG indicators
* Reference range mapping
* Extraction confidence scoring
* Report freshness validation

### 3. ML Prediction Layer (Disease-Wise Models)

* Anemia & hemoglobin estimation (Computer Vision – AnemiAI)
* Diabetes risk prediction
* Hypertension severity prediction
* Heart disease risk prediction
* Fever & infection severity prediction

Each model outputs:

* Risk score or severity band
* Confidence score
* Key contributing features

### 4. ML Fusion & Risk Aggregation Engine

* Combines outputs from all disease-specific models
* Normalizes scores into a unified risk scale
* Confidence-weighted fusion
* Lab-value prioritization over estimations

### 5. Urgency Scoring & Triage Engine

Urgency categories:

* Emergency – Immediate medical attention required
* Urgent – Evaluation within 24–48 hours
* Monitor – Observation with guidance
* Self-Care – Home management advice

Decisions are explainable and ML-driven.

### 6. Explainability & Reasoning Engine

* Human-readable explanations
* Highlighted abnormal values
* ML confidence transparency
* Simplified medical language

### 7. Care Navigation & Clinic Alert System

* Specialist mapping based on urgency
* Automated alerts to nearby clinics
* Patient summary and risk sharing
* Proactive follow-up enablement

---

## Implementation Breakdown

### Frontend

* Patient onboarding interface
* Symptom and vitals input
* Lab upload and camera capture
* Urgency visualization
* Reasoning and care guidance display

### Backend

* OCR processing services
* ML inference APIs
* Risk fusion engine
* Urgency classification logic
* Clinic notification system

### Machine Learning

* Disease-specific ML models for all supported conditions
* Confidence calibration
* Feedback-driven improvement
* Bias and safety validation

---

## Evaluation Metrics

* Reduction in missed high-risk cases
* Faster care access for urgent patients
* Explainability and patient comprehension
* Feasibility for rural healthcare adoption

---

## Safety & Scope

* TRIAGEON is a **risk assessment and triage system**
* It does **not provide final medical diagnoses**
* Clinical decisions remain with licensed professionals

---

## Project Status

**Project Completed**
All planned modules, ML models, and system components have been fully implemented and integrated.
