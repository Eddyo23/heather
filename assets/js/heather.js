(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var monthLabel = document.getElementById('calendar-month');
  var calendarGrid = document.getElementById('calendar-grid');
  var previousButton = document.getElementById('calendar-prev');
  var nextButton = document.getElementById('calendar-next');
  var timePanel = document.getElementById('time-panel');
  var timeSlots = document.getElementById('time-slots');
  var selectedDateLabel = document.getElementById('selected-date');
  var bookingEmail = document.getElementById('booking-email');
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  var selectedDate = null;
  var selectedTime = '';

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatTime(minutes) {
    var hour = Math.floor(minutes / 60);
    var minute = minutes % 60;
    var suffix = hour >= 12 ? 'PM' : 'AM';
    return (hour % 12 || 12) + ':' + String(minute).padStart(2, '0') + ' ' + suffix;
  }

  function availableTimes(date) {
    var day = date.getDay();
    if (day === 0 || day >= 5) return [];
    var start = day === 1 || day === 2 ? 10 * 60 : 16 * 60;
    var lastStart = day === 1 || day === 2 ? 16 * 60 + 30 : 18 * 60 + 30;
    var times = [];
    for (var minutes = start; minutes <= lastStart; minutes += 30) times.push(formatTime(minutes));
    return times;
  }

  function updateBookingLink() {
    if (!selectedDate || !selectedTime) {
      bookingEmail.classList.remove('is-ready');
      return;
    }
    var dateText = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    var subject = 'Lesson time request — ' + dateText + ' at ' + selectedTime;
    var body = 'Hi Heather,\n\nI would like to request a lesson on ' + dateText + ' at ' + selectedTime + '.\n\nStudent name:\nLesson type: Voice / Beginner piano / Tune Tots\n\nThank you!';
    bookingEmail.href = 'mailto:heather.eddy.music@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    bookingEmail.classList.add('is-ready');
  }

  function renderTimes() {
    selectedTime = '';
    bookingEmail.classList.remove('is-ready');
    timeSlots.innerHTML = '';
    if (!selectedDate) {
      timePanel.hidden = true;
      return;
    }
    timePanel.hidden = false;
    selectedDateLabel.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    availableTimes(selectedDate).forEach(function (time) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-slot';
      button.textContent = time;
      button.addEventListener('click', function () {
        timeSlots.querySelectorAll('.time-slot').forEach(function (slot) { slot.classList.remove('is-selected'); });
        button.classList.add('is-selected');
        selectedTime = time;
        updateBookingLink();
      });
      timeSlots.appendChild(button);
    });
  }

  function renderCalendar() {
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';
    monthLabel.textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    var firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    var daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    for (var blank = 0; blank < firstDay.getDay(); blank++) {
      var spacer = document.createElement('span');
      spacer.className = 'calendar-day is-outside';
      calendarGrid.appendChild(spacer);
    }
    for (var day = 1; day <= daysInMonth; day++) {
      (function () {
        var date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        var unavailable = availableTimes(date).length === 0;
        var past = date < today;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = String(day);
        button.setAttribute('role', 'gridcell');
        button.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        if (sameDay(date, today)) button.classList.add('is-today');
        if (sameDay(date, selectedDate)) button.classList.add('is-selected');
        if (unavailable || past) {
          button.disabled = true;
          button.classList.add('is-disabled');
          button.setAttribute('aria-label', button.getAttribute('aria-label') + ', unavailable');
        } else {
          button.addEventListener('click', function () {
            selectedDate = date;
            renderCalendar();
            renderTimes();
          });
        }
        calendarGrid.appendChild(button);
      }());
    }
  }

  if (previousButton && nextButton) {
    previousButton.addEventListener('click', function () {
      var previousMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      var currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if (previousMonth >= currentMonth) {
        viewDate = previousMonth;
        selectedDate = null;
        renderTimes();
        renderCalendar();
      }
    });
    nextButton.addEventListener('click', function () {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      selectedDate = null;
      renderTimes();
      renderCalendar();
    });
    renderCalendar();
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}());
