import { AddToCalendarButton } from "add-to-calendar-button-react";
import { WEBINAR_CONFIG } from "./webinarConfig";

interface Props {
  className?: string;
}

const WebinarCalendarButton = ({ className }: Props) => {
  const { calendarEvent } = WEBINAR_CONFIG;

  return (
    <div className={className}>
      <AddToCalendarButton
        name={calendarEvent.name}
        description={calendarEvent.description}
        startDate={calendarEvent.startDate}
        startTime={calendarEvent.startTime}
        endDate={calendarEvent.endDate}
        endTime={calendarEvent.endTime}
        timeZone={calendarEvent.timeZone}
        location={calendarEvent.location}
        organizer={calendarEvent.organizer}
        options={["Apple", "Google", "Outlook.com", "Microsoft365"]}
        label="Adicionar ao calendário"
        language="pt"
        lightMode="bodyScheme"
      />
    </div>
  );
};

export default WebinarCalendarButton;
