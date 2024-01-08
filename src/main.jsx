import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.scss'
import './styles/global.scss'

console.log(`%c ${import.meta.env.VITE_AUTHOR}`, 'color:#aaa;font-size:2rem;background:#222;')

import ErrorPage from './error-page'
const Layout = lazy(() => import('./routes/layout.jsx'))
import SplashScreen, { loader as splashScreenLoader } from './routes/splashScreen.jsx'
import Contact from './routes/contact.jsx'
import Home, { loader as homeLoader } from './routes/home.jsx'
import Tools, { loader as toolsLoader } from './routes/tools.jsx'
import VC from './routes/vc.jsx'
import Doctor from './routes/doctor.jsx'
import Allergy from './routes/allergy.jsx'
import Drug from './routes/drug.jsx'
import Hhs from './routes/hhs.jsx'
import Patient from './routes/patient.jsx'
import Feedback from './routes/feedback.jsx'
import About from './routes/about.jsx'
import FAQ from './routes/faq.jsx'
import Loading from './routes/components/LoadingSpinner'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        loader: splashScreenLoader,
        element: <SplashScreen title={`Welcome`} />,
      },
      {
        path: 'home',
        errorElement: <ErrorPage />,
        loader: homeLoader,
        element: <Home title={`Home`} />,
      },
      {
        path: 'tools',
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Tools to="/" replace />,
          },
          {
            path: ':recordId',
            loader: toolsLoader,
            element: <Tools />,
          },
        ],
      },
      {
        path: 'vc',
        element: <VC title={`VC`} />,
      },
      {
        path: 'doctor',
        element: <Doctor title={`Doctor`} />,
      },
      {
        path: 'allergy',
        element: <Allergy title={`Allergy`} />,
      },
      {
        path: 'drug',
        element: <Drug title={`Drug`} />,
      },
      {
        path: 'hhs',
        element: <Hhs title={`HHS`} />,
      },
      {
        path: 'patient',
        element: <Patient title={`Patient`} />,
      },
      {
        path: 'about',
        element: <About title={`About`} />,
      },
      {
        path: 'feedback',
        element: <Feedback title={`Feedback`} />,
      },
      {
        path: 'card',
        element: (
          <AuthProvider>
            <>card</>
          </AuthProvider>
        ),
      },

      {
        path: 'faq',
        loader: () => {
          return true
        },
        element: <FAQ />,
      },
      {
        path: 'contact',
        loader: () => {
          return true
        },
        element: <Contact />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
