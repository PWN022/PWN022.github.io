export function formatDate(date: Date, format: string = 'Y-m-d'): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const daysFull = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  const map: Record<string, () => string> = {
    'd': () => pad2(day),
    'm': () => pad2(month + 1),
    'Y': () => year.toString(),
    'y': () => year.toString().slice(-2),
    'F': () => monthsFull[month],
    'j': () => day.toString(),
    'D': () => daysShort[weekday],
    'l': () => daysFull[weekday],
    'S': () => getOrdinal(day),
    'M': () => monthsShort[month],
    'H': () => pad2(hours),
    'h': () => {
      let h = hours % 12;
      h = h === 0 ? 12 : h;
      return pad2(h);
    },
    'g': () => hours % 12 === 0 ? '12' : (hours % 12).toString(),
    'i': () => pad2(minutes),
    'a': () => hours < 12 ? 'am' : 'pm',
    'A': () => hours < 12 ? 'AM' : 'PM',
  };

  let result = '';
  for (const char of format) {
    result += map[char] ? map[char]() : char;
  }
  return result;
}
