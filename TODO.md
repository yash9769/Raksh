# TODO: Add AI Chatbot to Gamified Disaster Preparedness App

## Steps to Complete

- [x] Create AI Chatbot Component (`src/components/ai-chatbot.tsx`)
  - Implement chat interface with message display, input field, and send button
  - Add state management for conversation history
  - Integrate OpenAI GPT API for generating responses
  - Include system prompt for disaster preparedness context
  - Use existing UI components (Dialog, Button, Input, ScrollArea)

- [x] Update Student Dashboard (`src/components/student-dashboard.tsx`)
  - Add a button or card to open the chatbot dialog
  - Import and integrate the AI Chatbot component
  - Position the chatbot trigger in a logical location (e.g., near stats or modules)

- [x] Add Environment Variable Support
  - Update `.env` file or create one with `VITE_OPENAI_API_KEY`
  - Ensure secure handling of API key in the component

- [ ] Test Chatbot Integration
  - Verify API calls work correctly
  - Test chatbot responses for disaster preparedness queries
  - Ensure UI responsiveness and error handling

- [ ] Final Verification
  - Check that chatbot opens from dashboard
  - Confirm XP awarding for interactions (if implemented)
  - Validate overall app functionality remains intact
