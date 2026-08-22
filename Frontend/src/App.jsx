import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { MockInterviewProvider } from "./features/mockInterview/mockInterview.context.jsx"

function App() {

  return (
    <AuthProvider>
      <InterviewProvider>
        <MockInterviewProvider>
          <RouterProvider router={router} />
        </MockInterviewProvider>
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App