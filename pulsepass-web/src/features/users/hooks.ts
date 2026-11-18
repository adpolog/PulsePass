import { useMutation, useQuery } from '@tanstack/react-query'
import { getUserByEmail, registerUser } from './api'
import type { RegisterUserRequest } from './types'

export function useRegisterUser() {
  return useMutation({
    mutationFn: (data: RegisterUserRequest) => registerUser(data),
  })
}

export function useUserProfile(email: string) {
  return useQuery({
    queryKey: ['user', email],
    queryFn: () => getUserByEmail(email),
  })
}
