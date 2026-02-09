import { TypeOfInterest } from '@/backend';

export interface InterestOption {
  value: TypeOfInterest;
  label: string;
}

export const TYPE_OF_INTEREST_OPTIONS: InterestOption[] = [
  { value: TypeOfInterest.Price, label: 'Price' },
  { value: TypeOfInterest.Availability, label: 'Availability' },
  { value: TypeOfInterest.GroupBooking, label: 'Group Booking' },
];

export function getTypeOfInterestLabel(interest: TypeOfInterest): string {
  const option = TYPE_OF_INTEREST_OPTIONS.find((opt) => opt.value === interest);
  return option?.label || interest;
}
