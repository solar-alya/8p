/* jshint ignore:start */
@@include('vendor/tweenMax.min.js') // Animations
@@include('vendor/svg4everybody.min.js') // Svg sprites support
@@include('vendor/scrollTo.min.js') // Scroll to element
@@include('vendor/flickity.min.js') // Slider
/* jshint ignore:end */

$(document).ready(function() {
  init();
  svg4everybody();
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

  // Простой слайдер со стрелками. (спонсоры)

  $('.slider_simple').flickity({
    contain: true,
    pageDots: false,
    dragThreshold: 10,
    cellAlign: 'left',
    arrowShape: 'M0.335,38.395 L38.877,0.166 L42.222,3.346 L5.678,39.985 L42.344,76.623 L38.857,79.803 L0.335,41.574 L0.335,38.395 Z',
    groupCells: '100%',
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
    var clock = el;
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

  $('.count_down').each(function() {
    initializeClock($(this).get(0));
  });

  // *********************************
  // Tabs
  // *********************************

  $('.tab_choose:first-child').each(function() {
    var $this = $(this),
    getId = $this.data('tab');
    $this.addClass('active');
    $(getId).addClass('active');
  });

  $body.on('click', '.tab_choose', function() {
    var $this = $(this),
    getId = $this.data('tab');
    $(getId).add($this).addClass('active').siblings().removeClass('active');
  });

  // ******************************************
  // Секция Youtube с предпросмотром тамбнейлов
  // ******************************************

  $body.on('click', '.watch_youtube_thumbs .bg', function() {
    var $this = $(this),
    url = $this.attr('data-youtube');
    $('.watch_youtube_video iframe').attr('src', url);
  });

  // ******************************************
  // Dialogs
  // ******************************************

  var dialog = {
    init: function($dialog) {
      $dialog.each(function() {
        var $this = $(this);
        if ($this.closest('.dialog_handler').length !== 0) { return; }
        $this.wrap('<div class="dialog_handler">').after('<div class="dialog_bg || dialog_close">').wrap('<div class="dialog_tcell">');
      });
    },
    open: function($dialog) {
      var $handler = $dialog.closest('.dialog_handler');
      tm.set($handler, { display: 'table', autoAlpha: 0 });
      tm.to($handler, 0.4, { autoAlpha: 1, ease: Power3.easeOut });
      tm.fromTo($dialog, 0.4, { scale: 0.5, y: 50 }, { scale: 1, y: 0, ease: Power3.easeOut });
    },
    openYoutube: function(url) {
      var $dialog = $('#dialog_youtube');
      this.open($dialog);
      $dialog.find('iframe').attr('src', url + '?autoplay=1');
    },
    openZoom: function(url) {
      var $dialog = $('#dialog_gallery');
      this.open($dialog);
      $dialog.find('img').attr('src', url);
    },
    close: function($handler) {
      var $dialog = $handler.find('.dialog');
      tm.to($handler, 0.3, { display: 'none', autoAlpha: 0, ease: Power3.easeIn });
      tm.to($dialog, 0.3, { scale: 0.5, y: 50, ease: Power3.easeIn });
      $dialog.trigger('dialogClosed');
    }
  };

  // Инициализация
  dialog.init($('.dialog'));

  // Открытие
  $body.on('click', '.dialog_open', function(event) {
    var $this = $(this),
    $dialog = $($this.attr('data-dialog'));
    dialog.open($dialog);
    event.preventDefault();
  });

  // Открытие ютуб диалога
  $body.on('click', '.dialog_open_youtube', function(event) {
    event.preventDefault();
    dialog.openYoutube($(this).attr('data-youtube'));
  });

  // Зум картинок
  $body.on('click', '.image_zoom', function(event) {
    dialog.openZoom($(this).attr('data-image'));
  });

  // Закрытие диалога
  $body.on('click', '.dialog_close', function(event) {
    dialog.close($(this).closest('.dialog_handler'));
  });

  // Закрытие ютуб видео
  $body.on('dialogClosed', '#dialog_youtube', function(event) {
    $(this).find('iframe').attr('src', '');
  });

  // *****************************
  // Slider spinner
  // *****************************

  $('.slider_spinner').each(function() {
    var $slide = $(this).find('.slide'),
    length = $slide.length,
    tl = new TimelineMax({ repeat: -1 });
    for (var i = 0; i < length; i += 1) {
      tl.fromTo($slide[i], 0.3, { scale: 0.2, rotation: 180, autoAlpha: 0, display: 'none' }, { scale: 1, rotation: 0, autoAlpha: 1,  display: 'block' });
      tl.to($slide[i], 0.3, { scale: 0.2, rotation: -180, autoAlpha: 0,  display: 'none', delay: 4  });
    }
  });

    // *****************************
    // FAQ
    // *****************************

    // Init

    $('.question_block:first-child').each(function() {
      var $this = $(this);
      $this.addClass('active');
      $('.faq_answers').html($this.find('.answer').html());
      if ($window.innerWidth() < 768) {
        $this.find('.answer').show();
      }
    });

    $body.on('click', '.question', function() {
      var $this = $(this),
      $handler = $this.closest('.faq_handler'),
      $questionBlock = $this.closest('.question_block'),
      $answer = $this.next('.answer');
      $questionBlock.addClass('active').siblings().removeClass('active');
      if ($window.innerWidth() > 768) {
        $handler.find('.faq_answers').html($answer.html());
      } else {
        $answer.slideDown(200);
        $questionBlock.siblings().find('.answer').slideUp();
      }
    });

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
