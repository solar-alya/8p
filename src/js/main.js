/* jshint ignore:start */
@@include('vendor/tweenMax.min.js') // Animations
@@include('vendor/svg4everybody.min.js') // Svg sprites support
@@include('vendor/scrollTo.min.js') // Scroll to element
@@include('vendor/flickity.min.js') // Slider
/* jshint ignore:end */

$(document).ready(function() {
  init();
});

function init() {
  'use strict';
  var tm = TweenMax,
  mobileCond = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  $window = $(window),
  $document = $(document),
  $body = $('body'),
  $header = $('.header');

  // If touchscreen
  if (mobileCond) { $body.addClass('mobile'); }

  // If safari
  if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) { $body.addClass('safari'); }

  // If IE
  if (/*@cc_on!@*/false || !!document.documentMode) { $body.addClass('ie'); }

  // If bugzilla
  if (navigator.userAgent.search("Firefox") > -1) { $body.addClass('mozilla'); }

  // Как только видео прогрузится - показываем его.
  $('.section_video video').each(function() {
    $(this).on('loadeddata', function() {
      $(this).closest('.section_video').addClass('video_loaded');
    });
  });

  // ***************
  // Slider flickity
  // ***************

  $('.speakers_slider').flickity({
    adaptiveHeight: true,
    pageDots: false,
    contain: true,
    prevNextButtons: false,
    dragThreshold: 10,
    // groupCells: '100%',
  });

  $('.speakers_slider_mini').flickity({
    asNavFor: '.speakers_slider',
    contain: true,
    pageDots: false,
    prevNextButtons: false,
    dragThreshold: 10,
    // draggable: false
    // groupCells: 1,
  });

  // **************
  // Responsive nav
  // **************

  responsiveItems();
  function responsiveItems() {
    $('.nav_outer').each(function() {
      // debugger;
      var $this = $(this),
      $burger = $this.find('.nav_dropdown_trigger'),
      $inner = $this.find('.nav_inner'),
      $dropdown = $this.find('.nav_dropdown'),
      linkWidth,
      numOfItems = 0,
      breakWidths = [],
      totalSpace = 0,
      didResize = false,
      availableSpace, numOfVisibleItems, requiredSpace;
      $inner.children().innerWidth(function(i, w) {
        numOfItems += 1;
        totalSpace += w;
        breakWidths.push(totalSpace);
      });
      function update() {
        check();
        function check() {
          availableSpace = $inner.innerWidth() - 14;
          numOfVisibleItems = $inner.children().length;
          requiredSpace = breakWidths[numOfVisibleItems - 1];
          // Если не хватает места
          if (requiredSpace >= availableSpace) {
            $inner.children().last().prependTo($dropdown);
            numOfVisibleItems -= 1;
            check();
            // Если больше места
          } else if (availableSpace >= breakWidths[numOfVisibleItems]) {
            $dropdown.children().first().appendTo($inner);
            numOfVisibleItems += 1;
          }
          // Появление бургера
          if (numOfVisibleItems === numOfItems) {
            $burger.addClass('hidden');
            $this.removeClass('menu_visible');
          } else {
            $burger.removeClass('hidden');
            $this.addClass('menu_visible');
          }
        }
      }
      $window.on('resize', function() {
        didResize = true;
        setInterval(function () {
          if (didResize) {
            didResize = false;
            update();
          }
        }, 200);
      });
      update();
      $inner.addClass('inited');
    });
  }

  // *************************************************************
  // Когда проскроллили первую секцию - показываем кнопку в хедере
  // *************************************************************

  setHeaderButton();
  function setHeaderButton() {
    var $section = $('.section_hero'),
    sectionExist = $section.length === 0,
    end = sectionExist ? -1 : $section.offset().top + $section.innerHeight();
    // Убираем transition если секции нету, нам не нужна анимация в таком случае при инициализации
    if (sectionExist) { $header.addClass('no_transition'); }
    if ($window.scrollTop() > end) {
      $header.addClass('header_buy_ticket_visible');
    } else {
      $header.removeClass('header_buy_ticket_visible');
    }
  }

  // ****************************
  // Dropdowns
  // ****************************

  $body.on('click', '.dropdown_trigger', function(event) {
    var $this = $(this),
    $handler = $this.closest('.dropdown_handler'),
    $dropdown = $handler.find('.dropdown'),
    wWidth = $window.innerWidth(),
    hOffsetLeft = $handler.offset().left,
    wrapperPd = $('.wrapper').css('padding-left').replace("px",""),
    offset = 0,
    hWidth = 0,
    dWidth = 0,
    dOffsetLeft = 0;
    event.preventDefault();
    event.stopPropagation();
    // Показываем
    if (!$handler.hasClass('opened')) {
      tm.fromTo($dropdown, 0.3, { y: 20, autoAlpha: 0, display: 'none' }, { y: 0, autoAlpha: 1, display: 'block' });
      $handler.addClass('opened');
      hWidth = $handler.innerWidth();
      dWidth = $dropdown.innerWidth();
      dOffsetLeft = $dropdown.offset().left;
      // Если вылезет справа - подвигаем
      if (hOffsetLeft + dWidth/2 > wWidth) {
        offset = hOffsetLeft + dWidth - wWidth;
      }
      // Ставим по центру
      $dropdown.removeClass('align_right align_left');
      tm.set($dropdown, { 'margin-left': -(dWidth/2+offset/2) });
    }
    // Скрываем
    else {
      hideDropdown($dropdown, $handler);
    }
  });

  $document.on('click', function() {
    hideDropdown($('.dropdown'), $('.dropdown_handler'));
    $('.dropdown_handler').removeClass('opened');
  });

  function hideDropdown($dropdown, $handler) {
    tm.to($dropdown, 0.3, { autoAlpha: 0, display: 'none' });
    $handler.removeClass('opened');
  }

  // ***************************************************
  // Делаем что-то как только элемент появился на экране
  // ***************************************************

  onScreen();

  function onScreen() {
    var thisPos, offset,
    $window = $(window),
    wPos = $window.scrollTop(),
    wHeight = $window.height(),
    startAnim = wPos + wHeight;
    $('.on_screen:not(.animated)').each(function() {
      var $this = $(this),
      offset = $this.data('offset') || 0,
      thisPos = $this.offset().top;
      if ((!$this.hasClass('animated') && startAnim > thisPos + offset)) {
        $this.addClass('animated').trigger('onScreen');
      }
    });
  }

  // ****************************************
  // Scroll to. Анимируем к элементу по клику
  // ****************************************

  $('body').on('click', '.scroll_to', function(event) {
    var $this = $(this),
    $target = $($this.attr('href')),
    dist = $target.offset().top - $('.header').innerHeight() + 1;
    event.preventDefault();
    tm.to(window, 0.55, { scrollTo: dist, ease: Power4.easeInOut });
  });

  // Выставляем активные классы на менюшки в зависимости от секции

  function setScrollTo() {
    $('.scroll_to').each(function() {
      var $this = $(this),
      $target = $($this.attr('href')),
      wPos = $window.scrollTop();
      // if ($target.length === 0) { return false; }
      if (wPos >= $target.offset().top - $('.header').innerHeight()) {
        $('.scroll_to').removeClass('active');
        $this.addClass('active');
      }
    });
  }

  // **********
  // Count down
  // **********

  function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  function initializeClock(el) {
    var clock = document.querySelector(el);
    var endtime = clock.getAttribute('data-end');
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
      var t = getTimeRemaining(endtime);

      daysSpan.innerHTML = t.days;
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

      if (t.total <= 0) { clearInterval(timeinterval); }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
  }

  initializeClock('.count_down');


  // ****************************************************
  // Альтернатива $window.scroll. П - производительность.
  // ****************************************************

  windowScroll();

  function windowScroll() {
    var didScroll = false;
    $window.on('scroll', function () { didScroll = true; });
    setInterval(function () {
      if (didScroll) {
        didScroll = false;
        // Функции
        onScreen();
        setScrollTo();
        setHeaderButton();
      }
    }, 80);
  }

}
