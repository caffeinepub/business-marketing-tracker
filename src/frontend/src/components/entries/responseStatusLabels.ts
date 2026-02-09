import { ResponseStatus } from '@/backend';

export const RESPONSE_STATUS_OPTIONS: ResponseStatus[] = [
  ResponseStatus.NoResponse,
  ResponseStatus.ActiveDiscussion,
  ResponseStatus.LeadsGenerated,
  ResponseStatus.NegativeFeedback,
];

export function getResponseStatusLabel(status: ResponseStatus): string {
  switch (status) {
    case ResponseStatus.NoResponse:
      return 'No Response';
    case ResponseStatus.ActiveDiscussion:
      return 'Question';
    case ResponseStatus.LeadsGenerated:
      return 'Lead';
    case ResponseStatus.NegativeFeedback:
      return 'Negative Feedback';
    default:
      return status;
  }
}

export function getResponseStatusStyle(status: ResponseStatus): string {
  switch (status) {
    case ResponseStatus.LeadsGenerated:
      return 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    case ResponseStatus.NoResponse:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    case ResponseStatus.ActiveDiscussion:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case ResponseStatus.NegativeFeedback:
      return 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
}
