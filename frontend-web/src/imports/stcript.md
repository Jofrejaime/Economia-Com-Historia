Design a mobile-first educational application called:

“Economia com História – Angola”

---

🎯 PROJECT PURPOSE

This application aims to teach Angolan economic and social history through structured educational content.

The goal is NOT entertainment, but learning, reflection, and critical thinking.

The platform must feel serious, credible, and academic, similar to a modern digital learning platform.

---
## Design System(tokens)
``
{
"global": {
"color": {
"primary": {
"value": "#8B1E2D",
"type": "color"
},
"background": {
"default": {
"value": "#FFFFFF",
"type": "color"
},
"subtle": {
"value": "#F5F5F5",
"type": "color"
}
},
"text": {
"primary": {
"value": "#1F2937",
"type": "color"
},
"secondary": {
"value": "#4B5563",
"type": "color"
},
"muted": {
"value": "#9CA3AF",
"type": "color"
}
},
"border": {
"default": {
"value": "#E5E7EB",
"type": "color"
}
}
},

"font": {
  "family": {
    "heading": {
      "value": "IBM Plex Sans",
      "type": "fontFamilies"
    },
    "body": {
      "value": "Source Sans 3",
      "type": "fontFamilies"
    }
  },
  "size": {
    "xs": { "value": "12px", "type": "fontSizes" },
    "sm": { "value": "14px", "type": "fontSizes" },
    "md": { "value": "16px", "type": "fontSizes" },
    "lg": { "value": "18px", "type": "fontSizes" },
    "xl": { "value": "24px", "type": "fontSizes" },
    "2xl": { "value": "32px", "type": "fontSizes" }
  },
  "weight": {
    "regular": { "value": "400", "type": "fontWeights" },
    "medium": { "value": "500", "type": "fontWeights" },
    "bold": { "value": "700", "type": "fontWeights" }
  },
  "lineHeight": {
    "normal": { "value": "1.5", "type": "lineHeights" },
    "relaxed": { "value": "1.7", "type": "lineHeights" }
  }
},

"spacing": {
  "xs": { "value": "4px", "type": "spacing" },
  "sm": { "value": "8px", "type": "spacing" },
  "md": { "value": "16px", "type": "spacing" },
  "lg": { "value": "24px", "type": "spacing" },
  "xl": { "value": "32px", "type": "spacing" }
},

"radius": {
  "sm": { "value": "8px", "type": "borderRadius" },
  "md": { "value": "12px", "type": "borderRadius" },
  "lg": { "value": "16px", "type": "borderRadius" }
},

"border": {
  "width": {
    "default": { "value": "1px", "type": "borderWidth" }
  }
},

"button": {
  "primary": {
    "background": {
      "value": "{global.color.primary}",
      "type": "color"
    },
    "text": {
      "value": "#FFFFFF",
      "type": "color"
    },
    "radius": {
      "value": "{global.radius.sm}",
      "type": "borderRadius"
    }
  }
}
}
}

``

🧠 CORE CONCEPT

The app is CONTENT-CENTERED.

Users primarily:

* Explore content (text, video, audio)
* Read and learn
* Participate in discussions
* Optionally take quizzes for self-assessment

Quizzes are NOT the core feature.

---

🎨 VISUAL STYLE

* Clean and modern
* Professional and serious
* Academic tone (not playful)
* Minimalistic layout
* Strong readability

🚫 Avoid:

* Cartoons
* Illustrations
* Avatars
* AI-generated characters

✅ Use:

* Real photography of people
* Real-life contexts (students, workers, economic activity)

---

🎨 COLOR SYSTEM

Primary color:

* Bordeaux: #8B1E2D

Neutral palette:

* White: #FFFFFF (background)
* Light grey: #F5F5F5
* Medium grey: #9CA3AF
* Dark grey: #1F2937 (text)

Usage rules:

* Bordeaux for primary actions and highlights
* Grey tones for structure and hierarchy
* Avoid excessive color usage

---

🔤 TYPOGRAPHY

* Headings: IBM Plex Sans (bold, strong, professional)
* Body text: Source Sans 3 (high readability)

Hierarchy:

* Large titles (content titles)
* Medium subtitles
* Comfortable paragraph text for long reading

---

📏 SPACING & LAYOUT

* Use generous spacing for readability
* Mobile-first layout
* Clear separation between sections
* Vertical rhythm consistency

---

📱 NAVIGATION STRUCTURE

Bottom navigation with 5 tabs:

1. Home
2. Conteúdos
3. Comunidade
4. Quiz
5. Perfil

---

🗺️ MAIN USER FLOW

Home → Explore Content → Content Detail → Interaction → Optional Quiz → Continue Learning

---

📐 SCREEN STRUCTURE (BASED ON WIREFRAMES)

---

1. HOME SCREEN

* Search bar at top
* Section: “Continue Learning”
* Section: Recommended content (cards)
* Section: Active discussions
* Section: Top ranking preview

---

2. CONTENT LIST

* Search input
* Filters (theme, level, format)
* Content cards:

  * Image (real people)
  * Title
  * Short description

---

3. CONTENT DETAIL (MOST IMPORTANT SCREEN)

* Large title (IBM Plex Sans)

* Real image or video

* Long readable text (Source Sans 3)

* Action buttons:

  * Take Quiz
  * View Discussion
  * Comment

* Comments section below

---

4. QUIZ SCREEN

* One question per screen
* Multiple choice answers
* Clear selection states
* Simple layout

---

5. QUIZ FEEDBACK

* Correct or incorrect message
* Short explanation
* Next question button
* Option to return to content

---

6. QUIZ RESULT

* Final score
* Clear summary
* Buttons:

  * View ranking
  * Explore more content
  * Retry quiz

---

7. COMMUNITY (FORUM)

* List of discussion topics

* Each topic shows:

  * Title
  * Short preview

* Button: Create topic

---

8. TOPIC DETAIL

* Topic title and content
* List of replies
* Input field for response

---

9. PROFILE

* User name
* Total score
* Quizzes completed
* Clean layout

---

🧱 COMPONENTS

* Content cards
* Buttons (primary bordeaux, secondary grey)
* Inputs (search, comment)
* Bottom navigation bar
* Comment blocks

---

⚠️ UX RULES

* Content must always be the main focus
* Maintain strong visual hierarchy
* Avoid clutter
* Prioritize readability over decoration
* Ensure consistency across screens

---

🎯 FINAL GOAL

Create a friendly, modern educational platform that encourages reading, understanding, and discussion, not just interaction or gamification.
