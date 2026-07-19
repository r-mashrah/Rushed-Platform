import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import GradesSections from './pages/GradesSections'
import Subjects from './pages/Subjects'
import Students from './pages/Students'
import QuestionBank from './pages/QuestionBank'
import Exams from './pages/Exams'
import ContentReview from './pages/ContentReview'
import Parents from './pages/Parents'
import ReportsGrades from './pages/ReportsGrades'
import Attendance from './pages/Attendance'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="grades-sections" element={<GradesSections />} />
          <Route path="grades-sections/:gradeId" element={<GradesSections />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="students" element={<Students />} />
          <Route path="question-bank" element={<QuestionBank />} />
          <Route path="exams" element={<Exams />} />
          <Route path="content-review" element={<ContentReview />} />
          <Route path="parents" element={<Parents />} />
          <Route path="reports-grades" element={<ReportsGrades />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
