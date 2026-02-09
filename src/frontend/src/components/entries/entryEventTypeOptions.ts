import { EventType } from '@/backend';

export interface EventTypeOption {
  value: EventType;
  label: string;
}

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { value: EventType.GeneralDIYIndividual, label: 'General DIY (Individual)' },
  { value: EventType.BirthdayPartyKids, label: 'Birthday Party (Kids)' },
  { value: EventType.BirthdayPartyAdult, label: 'Birthday Party (Adult)' },
  { value: EventType.BacheloretteBridalShower, label: 'Bachelorette/Bridal Shower' },
  { value: EventType.GirlsNightOut, label: "Girls' Night Out" },
  { value: EventType.FieldTrips, label: 'Field Trips' },
  { value: EventType.CorporateTeamBuilding, label: 'Corporate Team Building' },
];

export function getEventTypeLabel(eventType: EventType): string {
  const option = EVENT_TYPE_OPTIONS.find((opt) => opt.value === eventType);
  return option?.label || eventType;
}
