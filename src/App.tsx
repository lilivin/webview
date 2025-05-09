import { useState } from "react";
import "./App.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Slider.css";
import logo from "./assets/restaurant-logo.png";
import { useForm } from "react-hook-form";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface FormData {
  date: Date;
  time: string;
}

const WEEKDAYS = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

function App() {
  const [value, onChange] = useState<Value>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { handleSubmit, setValue } = useForm<FormData>({
    mode: "onChange",
  });

  // Get subscriberId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subscriberId = urlParams.get("subscriberId");

  const onSubmit = (data: FormData) => {
    // Combine date and time into a single datetime string
    const dateObj = new Date(data.date);
    const [hours, minutes] = data.time.split(":");
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    const datetime = dateObj.toISOString();

    const url = `https://hook.eu1.make.com/wfz62qrtbkavrjinhcz5ta9zb9pefqh6?datetime=${encodeURIComponent(
      datetime
    )}&subscriberId=${encodeURIComponent(subscriberId || "")}`;

    fetch(url)
      .then(() => {
        // Try to close window for browsers that support it
        try {
          setTimeout(() => window.close(), 300);

          // Instead of trying to close window, show success message
          setIsSubmitted(true);
        } catch {
          // Silently fail if window.close() is not supported
        }
      })
      .catch(() => {
        alert("Nie udało się wysłać rezerwacji.");
      });
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
  };

  const times = [
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // Update form values when date changes
  const handleDateChange = (newValue: Value) => {
    onChange(newValue);
    if (newValue instanceof Date) {
      setValue("date", newValue, { shouldValidate: true });
    }
  };

  // Update form values when time changes
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setValue("time", time, { shouldValidate: true });
  };

  if (isSubmitted) {
    return (
      <div className="success-message">
        <img src={logo} alt="Restaurant Logo" className="logo" />
        <h2>Dziękujemy za złożenie rezerwacji!</h2>
        <p>Jesli okno nie zamknie sie automatycznie, zamknij je recznie i powróć do konwersacji, zeby potwierdzić rezerwacje.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <img src={logo} alt="Restaurant Logo" className="logo" />
      <Calendar
        onChange={handleDateChange}
        value={value}
        minDate={new Date()}
        maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const today = new Date();
            if (date.getDay() === 0 || date.getDay() === 6) {
              return "weekend-day";
            }
            if (
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            ) {
              return "today-date";
            }
          }
          return null;
        }}
        locale="pl-PL"
        formatShortWeekday={(_, date) => WEEKDAYS[date.getDay()]}
        formatMonthYear={(_, date) =>
          `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
        }
        prevLabel="‹"
        nextLabel="›"
        view="month"
      />
      <div className="slider-container">
        <Slider {...settings}>
          {times.map((time) => (
            <div
              key={time}
              className={`slider-item ${
                selectedTime === time ? "selected" : ""
              }`}
            >
              <label>
                <input
                  type="radio"
                  name="time"
                  value={time}
                  checked={selectedTime === time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
                <h3>{time}</h3>
              </label>
            </div>
          ))}
        </Slider>
      </div>
      <button
        type="submit"
        className="button"
        disabled={!value || !selectedTime}
      >
        Zatwierdź
      </button>
    </form>
  );
}

export default App;
