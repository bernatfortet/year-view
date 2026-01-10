import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '../components/landing/LandingPage'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/home')({
  component: HomeRoute,
})

function HomeRoute() {
  const { signIn } = useAuth()

  return <LandingPage signIn={signIn} />
}
