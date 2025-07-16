# WellNū System Storyboard & User Journey
## Complete Testing Scenarios for Selenium Automation

### 🎯 **PRIMARY USER FLOWS**

---

## **Flow 1: New User Onboarding Journey**
**Scenario:** First-time user downloads WellNū app
**Selenium Test ID:** `wellnu-onboarding-flow`

### 1.1 Registration Flow
```
START → Registration Screen
├── Enter Personal Details (firstName, lastName, age)
├── Set Body Metrics (weight, height)
├── Select Body Goals (lose weight, gain muscle, maintain)
├── Complete Profile Setup
└── Navigate to Home Screen
```

**Selenium Identifiers:**
- Input Fields: `#firstName-input`, `#lastName-input`, `#age-input`
- Body Metrics: `#weight-input`, `#height-input`
- Goal Selection: `#body-goal-selector`
- Submit Button: `#complete-registration-btn`

### 1.2 First Login & Gamification Introduction
```
Profile Screen → Daily Login Processing
├── XP Notification: "Welcome! +500 XP"
├── Level Badge Display: "Level 1 - Nutrition Newbie 🌱"
├── Achievement Unlock: "First Steps" (+100 XP)
└── Tutorial Tooltips for Features
```

**Expected Results:**
- Total XP: 600
- Level: 1
- Achievements: 1 (First Steps)
- Daily Streak: 1

---

## **Flow 2: Daily Food Logging & Nutrition Tracking**
**Scenario:** User logs meals throughout the day
**Selenium Test ID:** `wellnu-daily-logging-flow`

### 2.1 Breakfast Logging (Scan Method)
```
Home Screen → Scan Tab
├── Camera Permission Request
├── Scan Food Item (e.g., "Adobo with Rice")
├── Confirm Food Recognition
├── Set Portion Size
├── Add to Breakfast Log
└── XP Notification: "+75 XP for Scanning"
```

**Selenium Identifiers:**
- Scan Button: `#scan-food-btn`
- Food Confirmation: `#confirm-food-${foodId}`
- Portion Selector: `#portion-size-selector`
- Add to Log: `#add-to-breakfast-log`

### 2.2 Lunch Logging (Manual Entry)
```
Log Screen → Manual Entry
├── Search Filipino Foods Database
├── Select "Sinigang na Baboy"
├── Specify Serving Size
├── Log as Lunch
└── XP Notification: "+50 XP for Food Log"
```

### 2.3 WellNū Real-time Analysis
```
After Each Meal Log → Automatic Processing
├── Nutrient Analysis Update
├── Deficiency Detection
├── Filipino Food Recommendations
├── Real-time Alerts (if imbalances detected)
└── Progress Toward Daily Goals
```

**Expected Alerts:**
- "Iron Deficiency Detected - Try Malunggay or Dinuguan"
- "Great protein intake! 80% of daily goal achieved"
- "Hydration reminder: Drink water or fresh buko juice"

---

## **Flow 3: Weekly Challenge & Achievement System**
**Scenario:** User completes weekly nutrition challenge
**Selenium Test ID:** `wellnu-challenge-completion-flow`

### 3.1 Challenge Progression
```
Home Screen → Weekly Challenge Card
├── Challenge: "Log 5 Different Filipino Vegetables"
├── Progress Tracking: "3/5 completed"
├── Log Malunggay (counts as Filipino vegetable)
├── Log Kangkong (counts as Filipino vegetable)
├── Log Ampalaya (counts as Filipino vegetable)
└── Challenge Complete: "+750 XP"
```

### 3.2 Achievement Unlocks
```
Achievement System Processing
├── "Filipino Foodie" Achievement (20 local foods tried)
├── "Nutrition Ninja" Achievement (5 days goals met)
├── "Scanner Pro" Achievement (10 scans completed)
└── Level Up: "Level 5 - Calorie Counter ⭐"
```

**Selenium Identifiers:**
- Challenge Card: `#weekly-challenge-card`
- Progress Bar: `#challenge-progress-bar`
- Achievement Notification: `#achievement-unlock-${achievementId}`
- Level Up Modal: `#level-up-modal`

---

## **Flow 4: Social Sharing & Community Features**
**Scenario:** User shares nutrition progress with community
**Selenium Test ID:** `wellnu-social-sharing-flow`

### 4.1 Progress Sharing
```
Profile Screen → Share Progress Button
├── Generate Progress Image
├── Include Weekly Stats
├── Share Options (Facebook, Instagram, SMS)
├── Social Share Completed
└── XP Reward: "+100 XP for Social Share"
```

### 4.2 Achievement Sharing
```
Achievement Unlock → Auto-Share Prompt
├── "Share your Filipino Foodie achievement?"
├── Customize Share Message
├── Platform Selection
└── Community Engagement Tracking
```

---

## **Flow 5: Advanced WellNū Features**
**Scenario:** User engages with intelligent nutrition features
**Selenium Test ID:** `wellnu-advanced-features-flow`

### 5.1 Micronutrient Dashboard
```
Home Screen → WellNū Nutrient Status Card
├── View Micronutrient Progress Grid
├── Identify Deficiencies (Iron: 45% RDA)
├── Click "View Recommendations"
├── Filipino Food Suggestions Modal
└── Select Recommended Food to Log
```

### 5.2 Real-time Alert Response
```
Alert Notification → "High Sodium Intake Warning"
├── Alert Details: "2,800mg consumed (limit: 2,300mg)"
├── View Suggestions: "Choose fresh fish over dried fish"
├── Action Button: "Log Low-Sodium Meal"
├── Alternative Recommendations
└── Mark Alert as Resolved
```

### 5.3 Cultural Food Database Exploration
```
Home Screen → Filipino Food Database
├── Search Local Foods: "Adobo"
├── View Nutrition Details & Cultural Context
├── Read Preparation Tips
├── Add to Meal Plan
└── Save as Favorite Food
```

---

## **Flow 6: Long-term Engagement & Retention**
**Scenario:** User maintains 30-day streak
**Selenium Test ID:** `wellnu-retention-flow`

### 6.1 Streak Milestone
```
Daily Login (Day 30) → Milestone Processing
├── "Month Master" Achievement Unlock
├── Bonus XP: +1,000 (achievement) + 3,000 (streak bonus)
├── Level Progression Check
├── Special Badge Display
└── Streak Celebration Animation
```

### 6.2 Advanced User Journey
```
Experienced User → Advanced Features
├── Nutrition Pattern Analysis
├── Goal Achievement History
├── Community Leaderboard Position
├── Personalized Recommendations Based on History
└── Health Insights Dashboard
```

---

## **🧪 SELENIUM AUTOMATION SELECTORS**

### **Screen Navigation**
```css
#bottom-nav-home     /* Home screen tab */
#bottom-nav-log      /* Food logging tab */
#bottom-nav-track    /* Progress tracking tab */
#bottom-nav-scan     /* Food scanning tab */
#bottom-nav-profile  /* Profile tab */
```

### **Gamification Elements**
```css
#level-badge         /* Current level display */
#xp-notification     /* XP gain notification */
#achievement-modal   /* Achievement unlock popup */
#progress-bar        /* Level progress indicator */
#daily-streak        /* Login streak counter */
```

### **WellNū Specific Features**
```css
#nutrient-status-card       /* Micronutrient dashboard */
#filipino-food-database     /* Local food search */
#deficiency-alert          /* Nutrition imbalance warning */
#food-recommendations      /* AI suggestions */
#cultural-context-info     /* Filipino food context */
```

### **Data Validation Points**
```css
#total-xp-display          /* User's total experience points */
#level-title               /* Current level name */
#achievement-count         /* Number of unlocked achievements */
#daily-nutrition-summary   /* Daily macro/micro totals */
#weekly-challenge-progress /* Challenge completion status */
```

This storyboard provides complete coverage for Selenium automation testing, ensuring every major user flow and WellNū feature can be automatically tested and validated.
