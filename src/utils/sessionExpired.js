/** @deprecated import from @/utils/authSession */
export {
  handleUnauthorized as handleSessionExpired,
} from '@/services/authService'
export { isUnauthorizedError as isSessionExpiredError } from '@/utils/authSession'
