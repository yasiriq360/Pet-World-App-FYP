# Pet World-App-FYP
Final Year Project
# Pet World App (PawCare) 🐾

Welcome to the official repository for the **Pet World App (PawCare)**, our Final Year Project for the Bachelors of Science in Software Engineering at GIFT University. This comprehensive mobile ecosystem is designed to bridge the gap between pet owners and veterinary professionals, providing a one-stop solution for pet care management.

## 📖 Project Overview

In today's world, pet owners often struggle with scattered resources, finding it difficult to manage their pet's health, find reliable care information, and connect with trusted veterinarians. **PawCare** (Pet World App) solves this by integrating all essential pet care services into a single, user-friendly platform.

The project consists of two distinct mobile applications:

1.  **A Pet Parent App:** The all-in-one tool for pet owners to manage their pet's life, from health tracking to finding professional help.
2.  **A Veterinarian Panel:** A dedicated dashboard for vets to manage their professional services, schedule, and client communications.

-----

## ✨ Key Features

We've packed this ecosystem with features powered by **AI** and real-time database technology.

### 📱 For Pet Parents

  * **Pet Profile Management:** Create, edit, and delete detailed profiles for multiple pets.
  * **AI Breed Identification:** 🧬 Upload a photo and let our Machine Learning model identify your pet's breed instantly.
  * **AI Skin Disease Recognition:** ❤️‍🩹 A preliminary health monitor. Upload a photo of an affected skin area, and our AI will provide a potential analysis.
  * **Find Veterinarians:** 🏥 A location-based search to find nearby vets.
  * **Vet Consultation:** 💬 Book appointments based on a vet's real-time availability and chat directly with them through the app.
  * **ChatPaw (AI Chatbot):** 🤖 A 24/7 AI-powered chatbot to answer general pet-related queries.
  * **Pet Care Guides:** 📚 Access a library of complete care guides.

### 🩺 For Veterinarians

  * **Professional Profile:** Manage your public-facing profile, including your bio and the services you offer.
  * **Schedule Management:** 📅 Set and update your weekly availability and opening hours.
  * **Clinic Location:** 📍 Set your exact clinic location on a map.
  * **Client Communication:** ✉️ A built-in chat system to communicate with pet owners.

-----

## 🏛️ System Architecture

The application follows a **3-layer architecture** to separate concerns, ensure scalability, and maintain clean code.

1.  **Presentation Layer (UI):** The **React Native** application that users interact with.
2.  **Application Layer (Business Logic):** Contains the core logic, state management, and services like Authentication and AI model interfacing.
3.  **Data Layer:** Managed by **Firebase (Firestore)** for all user, pet, and vet data.

*(Replace this with a link to your architecture diagram image.)*

-----

## 🧠 Machine Learning Models

A core part of this project is the integration of deep learning models for intelligent features. All models were trained using **Python**, **TensorFlow**, and OpenCV.

| Model | Purpose | Best Performing Architecture | Validation Accuracy |
| :--- | :--- | :--- | :--- |
| **Dog Breed ID** | Identify a dog's breed from an image (130 classes) | **VGG16** | **86%** |
| **Cat Breed ID** | Identify a cat's breed from an image (37 classes) | **Xception** | **70%** |
| **Skin Disease ID** | Preliminary analysis of skin conditions (7 classes) | Yolov12 | (N/A) |
| **Cat vs. Dog** | A binary classifier | **Custom CNN** | **83%** |

-----

## 🛠️ Tech Stack & Tools

  * **Frontend (Mobile):** **React Native**
  * **Backend & Database:** **Firebase** (Authentication, Firestore, Realtime Database, Storage)
  * **Backend Server (for AI):** Node.js, Express.js
  * **Machine Learning:** **Python**, **TensorFlow**, OpenCV
  * **Design & Prototyping:** Figma, Adobe Illustrator

-----

### Prerequisites

  * Node.js & npm
  * React Native CLI
  * A Firebase project
  * Python (v3.9-3.12)
  * IDE
  * Install requirememnts and run app.py for using models and automation sever

## 👥 Our Team

This project was developed by a dedicated team of four students:

| Name | Registration Number |
| :--- | :--- |
| **Yasir Iqbal** | 211400168 |
| **Alman Aqib** | 211400181 |
| **Muhammad Ahmar**| 211400174 |
| **Muhammad Musa Meer**| 211400179 |

## 🎓 Acknowledgements

We extend our sincere gratitude to our project supervisor, **Ma’am Sadaf Naeem**, for her invaluable guidance, support, and patience throughout this project.

This project was submitted in partial fulfillment of the requirements for the degree of **Bachelors of Science in Software Engineering** at **GIFT University, Gujranwala**.
