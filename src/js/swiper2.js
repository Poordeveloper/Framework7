window.Swiper = function (container, params) {
    if (!(this instanceof Swiper)) return new Swiper(container, params);
    var defaults = {
        direction: 'horizontal',
        touchEventsTarget: 'container',
        initialSlide: 0,
        speed: 300,
        // autoplay
        autoplay: false,
        autoplayDisableOnInteraction: true,
        autoplayStopOnLast: false,
        // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
        iOSEdgeSwipeDetection: false,
        iOSEdgeSwipeThreshold: 20,
        // Set wrapper width
        setWrapperSize: false,
        // Virtual Translate
        virtualTranslate: false,
        // Hash Navigation
        hashnav: false,
        // Slides grid
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerColumnFill: 'column',
        slidesPerGroup: 1,
        centeredSlides: false,
        slidesOffsetBefore: 0, // in px
        slidesOffsetAfter: 0, // in px
        // Round length
        roundLengths: false,
        // Touches
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: 0.5,
        longSwipesMs: 300,
        followFinger: true,
        onlyExternal: false,
        threshold: 0,
        touchMoveStopPropagation: true,
        // Unique Navigation Elements
        uniqueNavElements: true,
        // Pagination
        pagination: null,
        paginationElement: 'span',
        paginationClickable: false,
        paginationHide: false,
        paginationBulletRender: null,
        paginationProgressRender: null,
        paginationFractionRender: null,
        paginationCustomRender: null,
        paginationType: 'bullets', // 'bullets' or 'progress' or 'fraction' or 'custom'
        // Resistance
        resistance: true,
        resistanceRatio: 0.85,
        // Next/prev buttons
        nextButton: null,
        prevButton: null,
        // Progress
        watchSlidesVisibility: false,
        // Cursor
        grabCursor: false,
        // Clicks
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        // loop
        loop: false,
        loopAdditionalSlides: 0,
        loopedSlides: null,
        // Swiping/no swiping
        allowSwipeToPrev: true,
        allowSwipeToNext: true,
        swipeHandler: null, //'.swipe-handler',
        noSwiping: true,
        noSwipingClass: 'swiper-no-swiping',
        // NS
        slideClass: 'swiper-slide',
        slideActiveClass: 'swiper-slide-active',
        slideVisibleClass: 'swiper-slide-visible',
        slideDuplicateClass: 'swiper-slide-duplicate',
        slideNextClass: 'swiper-slide-next',
        slidePrevClass: 'swiper-slide-prev',
        wrapperClass: 'swiper-wrapper',
        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
        buttonDisabledClass: 'swiper-button-disabled',
        paginationCurrentClass: 'swiper-pagination-current',
        paginationTotalClass: 'swiper-pagination-total',
        paginationHiddenClass: 'swiper-pagination-hidden',
        paginationProgressbarClass: 'swiper-pagination-progressbar',
        // Callbacks
        runCallbacksOnInit: true
    };
    var initialVirtualTranslate = params && params.virtualTranslate;
    
    params = params || {};
    var originalParams = {};
    for (var param in params) {
        if (typeof params[param] === 'object' && params[param] !== null && !(params[param].nodeType || params[param] === window || params[param] === document || (typeof Dom7 !== 'undefined' && params[param] instanceof Dom7) || (typeof jQuery !== 'undefined' && params[param] instanceof jQuery))) {
            originalParams[param] = {};
            for (var deepParam in params[param]) {
                originalParams[param][deepParam] = params[param][deepParam];
            }
        }
        else {
            originalParams[param] = params[param];
        }
    }
    for (var def in defaults) {
        if (typeof params[def] === 'undefined') {
            params[def] = defaults[def];
        }
        else if (typeof params[def] === 'object') {
            for (var deepDef in defaults[def]) {
                if (typeof params[def][deepDef] === 'undefined') {
                    params[def][deepDef] = defaults[def][deepDef];
                }
            }
        }
    }
    
    // Swiper
    var s = this;
    
    // Params
    s.params = params;
    s.originalParams = originalParams;
    
    // Classname
    s.classNames = [];
    /*=========================
      Dom Library and plugins
      ===========================*/
    if (typeof $ !== 'undefined' && typeof Dom7 !== 'undefined'){
        $ = Dom7;
    }
    if (typeof $ === 'undefined') {
        if (typeof Dom7 === 'undefined') {
            $ = window.Dom7 || window.Zepto || window.jQuery;
        }
        else {
            $ = Dom7;
        }
        if (!$) return;
    }
    // Export it to Swiper instance
    s.$ = $;
    
    /*=========================
      Preparation - Define Container, Wrapper and Pagination
      ===========================*/
    s.container = $(container);
    if (s.container.length === 0) return;
    if (s.container.length > 1) {
        var swipers = [];
        s.container.each(function () {
            var container = this;
            swipers.push(new Swiper(this, params));
        });
        return swipers;
    }
    
    // Save instance in container HTML Element and in data
    s.container[0].swiper = s;
    s.container.data('swiper', s);
    
    s.classNames.push('swiper-container-' + s.params.direction);
    
    if (!s.support.flexbox) {
        s.classNames.push('swiper-container-no-flexbox');
        s.params.slidesPerColumn = 1;
    }
    
    // Grab Cursor
    if (s.params.grabCursor && s.support.touch) {
        s.params.grabCursor = false;
    }
    
    // Wrapper
    s.wrapper = s.container.children('.' + s.params.wrapperClass);
    
    // Pagination
    if (s.params.pagination) {
        s.paginationContainer = $(s.params.pagination);
        if (s.params.uniqueNavElements && typeof s.params.pagination === 'string' && s.paginationContainer.length > 1 && s.container.find(s.params.pagination).length === 1) {
            s.paginationContainer = s.container.find(s.params.pagination);
        }
    
        if (s.params.paginationType === 'bullets' && s.params.paginationClickable) {
            s.paginationContainer.addClass('swiper-pagination-clickable');
        }
        else {
            s.params.paginationClickable = false;
        }
        s.paginationContainer.addClass('swiper-pagination-' + s.params.paginationType);
    }
    // Next/Prev Buttons
    if (s.params.nextButton || s.params.prevButton) {
        if (s.params.nextButton) {
            s.nextButton = $(s.params.nextButton);
            if (s.params.uniqueNavElements && typeof s.params.nextButton === 'string' && s.nextButton.length > 1 && s.container.find(s.params.nextButton).length === 1) {
                s.nextButton = s.container.find(s.params.nextButton);
            }
        }
        if (s.params.prevButton) {
            s.prevButton = $(s.params.prevButton);
            if (s.params.uniqueNavElements && typeof s.params.prevButton === 'string' && s.prevButton.length > 1 && s.container.find(s.params.prevButton).length === 1) {
                s.prevButton = s.container.find(s.params.prevButton);
            }
        }
    }
    
    // Is Horizontal
    s.isHorizontal = function () {
        return s.params.direction === 'horizontal';
    };
    // s.isH = isH;
    
    // RTL
    s.rtl = s.isHorizontal() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
    if (s.rtl) {
        s.classNames.push('swiper-container-rtl');
    }
    
    // Wrong RTL support
    if (s.rtl) {
        s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
    }
    
    // Columns
    if (s.params.slidesPerColumn > 1) {
        s.classNames.push('swiper-container-multirow');
    }
    
    // Check for Android
    if (s.device.android) {
        s.classNames.push('swiper-container-android');
    }
    
    // Add classes
    s.container.addClass(s.classNames.join(' '));
    
    // Translate
    s.translate = 0;
    
    // Velocity
    s.velocity = 0;
    
    /*=========================
      Locks, unlocks
      ===========================*/
    s.lockSwipeToNext = function () {
        s.params.allowSwipeToNext = false;
    };
    s.lockSwipeToPrev = function () {
        s.params.allowSwipeToPrev = false;
    };
    s.lockSwipes = function () {
        s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
    };
    s.unlockSwipeToNext = function () {
        s.params.allowSwipeToNext = true;
    };
    s.unlockSwipeToPrev = function () {
        s.params.allowSwipeToPrev = true;
    };
    s.unlockSwipes = function () {
        s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
    };
    
    /*=========================
      Round helper
      ===========================*/
    function round(a) {
        return Math.floor(a);
    }
    /*=========================
      Set grab cursor
      ===========================*/
    if (s.params.grabCursor) {
        s.container[0].style.cursor = 'move';
        s.container[0].style.cursor = '-webkit-grab';
        s.container[0].style.cursor = '-moz-grab';
        s.container[0].style.cursor = 'grab';
    }
    /*=========================
      Autoplay
      ===========================*/
    s.autoplayTimeoutId = undefined;
    s.autoplaying = false;
    s.autoplayPaused = false;
    function autoplay() {
        s.autoplayTimeoutId = setTimeout(function () {
            if (s.params.loop) {
                s.fixLoop();
                s._slideNext();
                s.emit('onAutoplay', s);
            }
            else {
                if (!s.isEnd) {
                    s._slideNext();
                    s.emit('onAutoplay', s);
                }
                else {
                    if (!params.autoplayStopOnLast) {
                        s._slideTo(0);
                        s.emit('onAutoplay', s);
                    }
                    else {
                        s.stopAutoplay();
                    }
                }
            }
        }, s.params.autoplay);
    }
    s.startAutoplay = function () {
        if (typeof s.autoplayTimeoutId !== 'undefined') return false;
        if (!s.params.autoplay) return false;
        if (s.autoplaying) return false;
        s.autoplaying = true;
        s.emit('onAutoplayStart', s);
        autoplay();
    };
    s.stopAutoplay = function (internal) {
        if (!s.autoplayTimeoutId) return;
        if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
        s.autoplaying = false;
        s.autoplayTimeoutId = undefined;
        s.emit('onAutoplayStop', s);
    };
    s.pauseAutoplay = function (speed) {
        if (s.autoplayPaused) return;
        if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
        s.autoplayPaused = true;
        if (speed === 0) {
            s.autoplayPaused = false;
            autoplay();
        }
        else {
            s.wrapper.transitionEnd(function () {
                if (!s) return;
                s.autoplayPaused = false;
                if (!s.autoplaying) {
                    s.stopAutoplay();
                }
                else {
                    autoplay();
                }
            });
        }
    };
    /*=========================
      Min/Max Translate
      ===========================*/
    s.minTranslate = function () {
        return (-s.snapGrid[0]);
    };
    s.maxTranslate = function () {
        return (-s.snapGrid[s.snapGrid.length - 1]);
    };
    /*=========================
      Slider/slides sizes
      ===========================*/
    s.updateContainerSize = function () {
        var width, height;
        if (typeof s.params.width !== 'undefined') {
            width = s.params.width;
        }
        else {
            width = s.container[0].clientWidth;
        }
        if (typeof s.params.height !== 'undefined') {
            height = s.params.height;
        }
        else {
            height = s.container[0].clientHeight;
        }
        if (width === 0 && s.isHorizontal() || height === 0 && !s.isHorizontal()) {
            return;
        }
    
        //Subtract paddings
        width = width - parseInt(s.container.css('padding-left'), 10) - parseInt(s.container.css('padding-right'), 10);
        height = height - parseInt(s.container.css('padding-top'), 10) - parseInt(s.container.css('padding-bottom'), 10);
    
        // Store values
        s.width = width;
        s.height = height;
        s.size = s.isHorizontal() ? s.width : s.height;
    };
    
    s.updateSlidesSize = function () {
        s.slides = s.wrapper.children('.' + s.params.slideClass);
        s.snapGrid = [];
        s.slidesGrid = [];
        s.slidesSizesGrid = [];
    
        var spaceBetween = s.params.spaceBetween,
            slidePosition = -s.params.slidesOffsetBefore,
            i,
            prevSlideSize = 0,
            index = 0;
        if (typeof s.size === 'undefined') return;
        if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
            spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
        }
    
        s.virtualSize = -spaceBetween;
        // reset margins
        if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
        else s.slides.css({marginRight: '', marginBottom: ''});
    
        var slidesNumberEvenToRows;
        if (s.params.slidesPerColumn > 1) {
            if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                slidesNumberEvenToRows = s.slides.length;
            }
            else {
                slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
            }
            if (s.params.slidesPerView !== 'auto' && s.params.slidesPerColumnFill === 'row') {
                slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, s.params.slidesPerView * s.params.slidesPerColumn);
            }
        }
    
        // Calc slides
        var slideSize;
        var slidesPerColumn = s.params.slidesPerColumn;
        var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
        var numFullColumns = slidesPerRow - (s.params.slidesPerColumn * slidesPerRow - s.slides.length);
        for (i = 0; i < s.slides.length; i++) {
            slideSize = 0;
            var slide = s.slides.eq(i);
            if (s.params.slidesPerColumn > 1) {
                // Set slides order
                var newSlideOrderIndex;
                var column, row;
                if (s.params.slidesPerColumnFill === 'column') {
                    column = Math.floor(i / slidesPerColumn);
                    row = i - column * slidesPerColumn;
                    if (column > numFullColumns || (column === numFullColumns && row === slidesPerColumn-1)) {
                        if (++row >= slidesPerColumn) {
                            row = 0;
                            column++;
                        }
                    }
                    newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                    slide
                        .css({
                            '-webkit-box-ordinal-group': newSlideOrderIndex,
                            '-moz-box-ordinal-group': newSlideOrderIndex,
                            '-ms-flex-order': newSlideOrderIndex,
                            '-webkit-order': newSlideOrderIndex,
                            'order': newSlideOrderIndex
                        });
                }
                else {
                    row = Math.floor(i / slidesPerRow);
                    column = i - row * slidesPerRow;
                }
                slide
                    .css({
                        'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                    })
                    .attr('data-swiper-column', column)
                    .attr('data-swiper-row', row);
    
            }
            if (slide.css('display') === 'none') continue;
            if (s.params.slidesPerView === 'auto') {
                slideSize = s.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
                if (s.params.roundLengths) slideSize = round(slideSize);
            }
            else {
                slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                if (s.params.roundLengths) slideSize = round(slideSize);
    
                if (s.isHorizontal()) {
                    s.slides[i].style.width = slideSize + 'px';
                }
                else {
                    s.slides[i].style.height = slideSize + 'px';
                }
            }
            s.slides[i].swiperSlideSize = slideSize;
            s.slidesSizesGrid.push(slideSize);
    
    
            if (s.params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                s.slidesGrid.push(slidePosition);
            }
            else {
                if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                s.slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
    
            s.virtualSize += slideSize + spaceBetween;
    
            prevSlideSize = slideSize;
    
            index ++;
        }
        s.virtualSize = Math.max(s.virtualSize, s.size) + s.params.slidesOffsetAfter;
        var newSlidesGrid;
    
        if (s.params.slidesPerColumn > 1) {
            s.virtualSize = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
            s.virtualSize = Math.ceil(s.virtualSize / s.params.slidesPerColumn) - s.params.spaceBetween;
            s.wrapper.css({width: s.virtualSize + s.params.spaceBetween + 'px'});
            if (s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
                }
                s.snapGrid = newSlidesGrid;
            }
        }
    
        // Remove last grid elements depending on width
        if (!s.params.centeredSlides) {
            newSlidesGrid = [];
            for (i = 0; i < s.snapGrid.length; i++) {
                if (s.snapGrid[i] <= s.virtualSize - s.size) {
                    newSlidesGrid.push(s.snapGrid[i]);
                }
            }
            s.snapGrid = newSlidesGrid;
            if (Math.floor(s.virtualSize - s.size) - Math.floor(s.snapGrid[s.snapGrid.length - 1]) > 1) {
                s.snapGrid.push(s.virtualSize - s.size);
            }
        }
        if (s.snapGrid.length === 0) s.snapGrid = [0];
    
        if (s.params.spaceBetween !== 0) {
            if (s.isHorizontal()) {
                if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
                else s.slides.css({marginRight: spaceBetween + 'px'});
            }
            else s.slides.css({marginBottom: spaceBetween + 'px'});
        }
    };
    
    s.updateActiveIndex = function () {
        var translate = s.rtl ? s.translate : -s.translate;
        var newActiveIndex, i, snapIndex;
        for (i = 0; i < s.slidesGrid.length; i ++) {
            if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                    newActiveIndex = i;
                }
                else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                    newActiveIndex = i + 1;
                }
            }
            else {
                if (translate >= s.slidesGrid[i]) {
                    newActiveIndex = i;
                }
            }
        }
        // Normalize slideIndex
        if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
        // for (i = 0; i < s.slidesGrid.length; i++) {
            // if (- translate >= s.slidesGrid[i]) {
                // newActiveIndex = i;
            // }
        // }
        snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
        if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;
    
        if (newActiveIndex === s.activeIndex) {
            return;
        }
        s.snapIndex = snapIndex;
        s.previousIndex = s.activeIndex;
        s.activeIndex = newActiveIndex;
        s.updateClasses();
    };
    
    /*=========================
      Classes
      ===========================*/
    s.updateClasses = function () {
        s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
        var activeSlide = s.slides.eq(s.activeIndex);
        // Active classes
        activeSlide.addClass(s.params.slideActiveClass);
        // Next Slide
        var nextSlide = activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
        if (s.params.loop && nextSlide.length === 0) {
            s.slides.eq(0).addClass(s.params.slideNextClass);
        }
        // Prev Slide
        var prevSlide = activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
        if (s.params.loop && prevSlide.length === 0) {
            s.slides.eq(-1).addClass(s.params.slidePrevClass);
        }
    
        // Pagination
        if (s.paginationContainer && s.paginationContainer.length > 0) {
            // Current/Total
            var current,
                total = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
            if (s.params.loop) {
                current = Math.ceil((s.activeIndex - s.loopedSlides)/s.params.slidesPerGroup);
                if (current > s.slides.length - 1 - s.loopedSlides * 2) {
                    current = current - (s.slides.length - s.loopedSlides * 2);
                }
                if (current > total - 1) current = current - total;
                if (current < 0 && s.params.paginationType !== 'bullets') current = total + current;
            }
            else {
                if (typeof s.snapIndex !== 'undefined') {
                    current = s.snapIndex;
                }
                else {
                    current = s.activeIndex || 0;
                }
            }
            // Types
            if (s.params.paginationType === 'bullets' && s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                if (s.paginationContainer.length > 1) {
                    s.bullets.each(function () {
                        if ($(this).index() === current) $(this).addClass(s.params.bulletActiveClass);
                    });
                }
                else {
                    s.bullets.eq(current).addClass(s.params.bulletActiveClass);
                }
            }
            if (s.params.paginationType === 'fraction') {
                s.paginationContainer.find('.' + s.params.paginationCurrentClass).text(current + 1);
                s.paginationContainer.find('.' + s.params.paginationTotalClass).text(total);
            }
            if (s.params.paginationType === 'progress') {
                var scale = (current + 1) / total,
                    scaleX = scale,
                    scaleY = 1;
                if (!s.isHorizontal()) {
                    scaleY = scale;
                    scaleX = 1;
                }
                s.paginationContainer.find('.' + s.params.paginationProgressbarClass).transform('translate3d(0,0,0) scaleX(' + scaleX + ') scaleY(' + scaleY + ')').transition(s.params.speed);
            }
            if (s.params.paginationType === 'custom' && s.params.paginationCustomRender) {
                s.paginationContainer.html(s.params.paginationCustomRender(s, current + 1, total));
                s.emit('onPaginationRendered', s, s.paginationContainer[0]);
            }
        }
    
        // Next/active buttons
        if (!s.params.loop) {
            if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
                if (s.isBeginning) {
                    s.prevButton.addClass(s.params.buttonDisabledClass);
                }
                else {
                    s.prevButton.removeClass(s.params.buttonDisabledClass);
                }
            }
            if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
                if (s.isEnd) {
                    s.nextButton.addClass(s.params.buttonDisabledClass);
                }
                else {
                    s.nextButton.removeClass(s.params.buttonDisabledClass);
                }
            }
        }
    };
    
    /*=========================
      Pagination
      ===========================*/
    s.updatePagination = function () {
        if (!s.params.pagination) return;
        if (s.paginationContainer && s.paginationContainer.length > 0) {
            var paginationHTML = '';
            if (s.params.paginationType === 'bullets') {
                var numberOfBullets = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    if (s.params.paginationBulletRender) {
                        paginationHTML += s.params.paginationBulletRender(i, s.params.bulletClass);
                    }
                    else {
                        paginationHTML += '<' + s.params.paginationElement+' class="' + s.params.bulletClass + '"></' + s.params.paginationElement + '>';
                    }
                }
                s.paginationContainer.html(paginationHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
            if (s.params.paginationType === 'fraction') {
                if (s.params.paginationFractionRender) {
                    paginationHTML = s.params.paginationFractionRender(s, s.params.paginationCurrentClass, s.params.paginationTotalClass);
                }
                else {
                    paginationHTML =
                        '<span class="' + s.params.paginationCurrentClass + '"></span>' +
                        ' / ' +
                        '<span class="' + s.params.paginationTotalClass+'"></span>';
                }
                s.paginationContainer.html(paginationHTML);
            }
            if (s.params.paginationType === 'progress') {
                if (s.params.paginationProgressRender) {
                    paginationHTML = s.params.paginationProgressRender(s, s.params.paginationProgressbarClass);
                }
                else {
                    paginationHTML = '<span class="' + s.params.paginationProgressbarClass + '"></span>';
                }
                s.paginationContainer.html(paginationHTML);
            }
            if (s.params.paginationType !== 'custom') {
                s.emit('onPaginationRendered', s, s.paginationContainer[0]);
            }
        }
    };
    /*=========================
      Common update method
      ===========================*/
    s.update = function (updateTranslate) {
        s.updateContainerSize();
        s.updateSlidesSize();
        s.updatePagination();
        s.updateClasses();
        function forceSetTranslate() {
            newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
            s.setWrapperTranslate(newTranslate);
            s.updateActiveIndex();
            s.updateClasses();
        }
        if (updateTranslate) {
            var translated, newTranslate;
            {
                if ((s.params.slidesPerView === 'auto' || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) {
                    translated = s.slideTo(s.slides.length - 1, 0, false, true);
                }
                else {
                    translated = s.slideTo(s.activeIndex, 0, false, true);
                }
                if (!translated) {
                    forceSetTranslate();
                }
            }
        }
    };
    
    /*=========================
      Resize Handler
      ===========================*/
    s.onResize = function (forceUpdatePagination) {
        // Disable locks on resize
        var allowSwipeToPrev = s.params.allowSwipeToPrev;
        var allowSwipeToNext = s.params.allowSwipeToNext;
        s.params.allowSwipeToPrev = s.params.allowSwipeToNext = true;
    
        s.updateContainerSize();
        s.updateSlidesSize();
        if (s.params.slidesPerView === 'auto' || forceUpdatePagination) s.updatePagination();
        var slideChangedBySlideTo = false;
        {
            s.updateClasses();
            if ((s.params.slidesPerView === 'auto' || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) {
                slideChangedBySlideTo = s.slideTo(s.slides.length - 1, 0, false, true);
            }
            else {
                slideChangedBySlideTo = s.slideTo(s.activeIndex, 0, false, true);
            }
        }
        // Return locks after resize
        s.params.allowSwipeToPrev = allowSwipeToPrev;
        s.params.allowSwipeToNext = allowSwipeToNext;
    };
    
    /*=========================
      Events
      ===========================*/
    
    //Define Touch Events
    var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
    if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
    else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
    s.touchEvents = {
        start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
        move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
        end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
    };
    
    
    // WP8 Touch Events Fix
    if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
        (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
    }
    
    // Attach/detach events
    s.initEvents = function (detach) {
        var actionDom = detach ? 'off' : 'on';
        var action = detach ? 'removeEventListener' : 'addEventListener';
        var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
        var target = s.support.touch ? touchEventsTarget : document;
    
        var moveCapture = s.params.nested ? true : false;
    
        //Touch Events
        if (s.browser.ie) {
            touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
            target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
            target[action](s.touchEvents.end, s.onTouchEnd, false);
        }
        else {
            if (s.support.touch) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
            }
            if (params.simulateTouch && !s.device.ios && !s.device.android) {
                touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                document[action]('mousemove', s.onTouchMove, moveCapture);
                document[action]('mouseup', s.onTouchEnd, false);
            }
        }
        window[action]('resize', s.onResize);
    
        // Next, Prev, Index
        if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
            s.nextButton[actionDom]('click', s.onClickNext);
        }
        if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
            s.prevButton[actionDom]('click', s.onClickPrev);
        }
        if (s.params.pagination && s.params.paginationClickable) {
            s.paginationContainer[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
        }
    
        // Prevent Links Clicks
        if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
    };
    s.attachEvents = function () {
        s.initEvents();
    };
    s.detachEvents = function () {
        s.initEvents(true);
    };
    
    /*=========================
      Handle Clicks
      ===========================*/
    // Prevent Clicks
    s.allowClick = true;
    s.preventClicks = function (e) {
        if (!s.allowClick) {
            if (s.params.preventClicks) e.preventDefault();
            if (s.params.preventClicksPropagation && s.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    };
    // Clicks
    s.onClickNext = function (e) {
        e.preventDefault();
        if (s.isEnd && !s.params.loop) return;
        s.slideNext();
    };
    s.onClickPrev = function (e) {
        e.preventDefault();
        if (s.isBeginning && !s.params.loop) return;
        s.slidePrev();
    };
    s.onClickIndex = function (e) {
        e.preventDefault();
        var index = $(this).index() * s.params.slidesPerGroup;
        if (s.params.loop) index = index + s.loopedSlides;
        s.slideTo(index);
    };
    
    /*=========================
      Handle Touches
      ===========================*/
    function findElementInEvent(e, selector) {
        var el = $(e.target);
        if (!el.is(selector)) {
            if (typeof selector === 'string') {
                el = el.parents(selector);
            }
            else if (selector.nodeType) {
                var found;
                el.parents().each(function (index, _el) {
                    if (_el === selector) found = selector;
                });
                if (!found) return undefined;
                else return selector;
            }
        }
        if (el.length === 0) {
            return undefined;
        }
        return el[0];
    }
    s.updateClickedSlide = function (e) {
        var slide = findElementInEvent(e, '.' + s.params.slideClass);
        var slideFound = false;
        if (slide) {
            for (var i = 0; i < s.slides.length; i++) {
                if (s.slides[i] === slide) slideFound = true;
            }
        }
    
        if (slide && slideFound) {
            s.clickedSlide = slide;
            s.clickedIndex = $(slide).index();
        }
        else {
            s.clickedSlide = undefined;
            s.clickedIndex = undefined;
            return;
        }
        if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
            var slideToIndex = s.clickedIndex,
                realIndex,
                duplicatedSlides;
            if (s.params.loop) {
                if (s.animating) return;
                realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                if (s.params.centeredSlides) {
                    if ((slideToIndex < s.loopedSlides - s.params.slidesPerView/2) || (slideToIndex > s.slides.length - s.loopedSlides + s.params.slidesPerView/2)) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.swiper-slide-duplicate)').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
                else {
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]:not(.swiper-slide-duplicate)').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
            }
            else {
                s.slideTo(slideToIndex);
            }
        }
    };
    
    var isTouched,
        isMoved,
        allowTouchCallbacks,
        touchStartTime,
        isScrolling,
        currentTranslate,
        startTranslate,
        allowThresholdMove,
        // Form elements to match
        formElements = 'input, select, textarea, button',
        // Last click time
        lastClickTime = Date.now(), clickTimeout,
        //Velocities
        velocities = [],
        allowMomentumBounce;
    
    // Animating Flag
    s.animating = false;
    
    // Touches information
    s.touches = {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
    };
    
    // Touch handlers
    var isTouchEvent, startMoving;
    s.onTouchStart = function (e) {
        if (e.originalEvent) e = e.originalEvent;
        isTouchEvent = e.type === 'touchstart';
        if (!isTouchEvent && 'which' in e && e.which === 3) return;
        if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
            s.allowClick = true;
            return;
        }
        if (s.params.swipeHandler) {
            if (!findElementInEvent(e, s.params.swipeHandler)) return;
        }
    
        var startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        var startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    
        // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore
        if(s.device.ios && s.params.iOSEdgeSwipeDetection && startX <= s.params.iOSEdgeSwipeThreshold) {
            return;
        }
    
        isTouched = true;
        isMoved = false;
        allowTouchCallbacks = true;
        isScrolling = undefined;
        startMoving = undefined;
        s.touches.startX = startX;
        s.touches.startY = startY;
        touchStartTime = Date.now();
        s.allowClick = true;
        s.updateContainerSize();
        s.swipeDirection = undefined;
        if (s.params.threshold > 0) allowThresholdMove = false;
        if (e.type !== 'touchstart') {
            var preventDefault = true;
            if ($(e.target).is(formElements)) preventDefault = false;
            if (document.activeElement && $(document.activeElement).is(formElements)) {
                document.activeElement.blur();
            }
            if (preventDefault) {
                e.preventDefault();
            }
        }
        s.emit('onTouchStart', s, e);
    };
    
    s.onTouchMove = function (e) {
        if (e.originalEvent) e = e.originalEvent;
        if (isTouchEvent && e.type === 'mousemove') return;
        if (e.preventedByNestedSwiper) {
            s.touches.startX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            return;
        }
        if (s.params.onlyExternal) {
            // isMoved = true;
            s.allowClick = false;
            if (isTouched) {
                s.touches.startX = s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                s.touches.startY = s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = Date.now();
            }
            return;
        }
        if (isTouchEvent && document.activeElement) {
            if (e.target === document.activeElement && $(e.target).is(formElements)) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
        }
        if (allowTouchCallbacks) {
            s.emit('onTouchMove', s, e);
        }
        if (e.targetTouches && e.targetTouches.length > 1) return;
    
        s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
    
        if (typeof isScrolling === 'undefined') {
            var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
            isScrolling = s.isHorizontal() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
        }
        if (isScrolling) {
            s.emit('onTouchMoveOpposite', s, e);
        }
        if (typeof startMoving === 'undefined' && s.browser.ieTouch) {
            if (s.touches.currentX !== s.touches.startX || s.touches.currentY !== s.touches.startY) {
                startMoving = true;
            }
        }
        if (!isTouched) return;
        if (isScrolling)  {
            isTouched = false;
            return;
        }
        if (!startMoving && s.browser.ieTouch) {
            return;
        }
        s.allowClick = false;
        s.emit('onSliderMove', s, e);
        e.preventDefault();
        if (s.params.touchMoveStopPropagation && !s.params.nested) {
            e.stopPropagation();
        }
    
        if (!isMoved) {
            if (params.loop) {
                s.fixLoop();
            }
            startTranslate = s.getWrapperTranslate();
            s.setWrapperTransition(0);
            if (s.animating) {
                s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
            }
            if (s.params.autoplay && s.autoplaying) {
                if (s.params.autoplayDisableOnInteraction) {
                    s.stopAutoplay();
                }
                else {
                    s.pauseAutoplay();
                }
            }
            allowMomentumBounce = false;
            //Grab Cursor
            if (s.params.grabCursor) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grabbing';
                s.container[0].style.cursor = '-moz-grabbin';
                s.container[0].style.cursor = 'grabbing';
            }
        }
        isMoved = true;
    
        var diff = s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
    
        diff = diff * s.params.touchRatio;
        if (s.rtl) diff = -diff;
    
        s.swipeDirection = diff > 0 ? 'prev' : 'next';
        currentTranslate = diff + startTranslate;
    
        var disableParentSwiper = true;
        if ((diff > 0 && currentTranslate > s.minTranslate())) {
            disableParentSwiper = false;
            if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
        }
        else if (diff < 0 && currentTranslate < s.maxTranslate()) {
            disableParentSwiper = false;
            if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
        }
    
        if (disableParentSwiper) {
            e.preventedByNestedSwiper = true;
        }
    
        // Directions locks
        if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
            currentTranslate = startTranslate;
        }
        if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
            currentTranslate = startTranslate;
        }
    
        if (!s.params.followFinger) return;
    
        // Threshold
        if (s.params.threshold > 0) {
            if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                if (!allowThresholdMove) {
                    allowThresholdMove = true;
                    s.touches.startX = s.touches.currentX;
                    s.touches.startY = s.touches.currentY;
                    currentTranslate = startTranslate;
                    s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                    return;
                }
            }
            else {
                currentTranslate = startTranslate;
                return;
            }
        }
        // Update translate
        s.setWrapperTranslate(currentTranslate);
    };
    s.onTouchEnd = function (e) {
        if (e.originalEvent) e = e.originalEvent;
        if (allowTouchCallbacks) {
            s.emit('onTouchEnd', s, e);
        }
        allowTouchCallbacks = false;
        if (!isTouched) return;
        //Return Grab Cursor
        if (s.params.grabCursor && isMoved && isTouched) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
    
        // Time diff
        var touchEndTime = Date.now();
        var timeDiff = touchEndTime - touchStartTime;
    
        // Tap, doubleTap, Click
        if (s.allowClick) {
            s.updateClickedSlide(e);
            s.emit('onTap', s, e);
            if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                if (clickTimeout) clearTimeout(clickTimeout);
                clickTimeout = setTimeout(function () {
                    if (!s) return;
                    if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                        s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                    }
                    s.emit('onClick', s, e);
                }, 300);
    
            }
            if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                if (clickTimeout) clearTimeout(clickTimeout);
                s.emit('onDoubleTap', s, e);
            }
        }
    
        lastClickTime = Date.now();
        setTimeout(function () {
            if (s) s.allowClick = true;
        }, 0);
    
        if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
            isTouched = isMoved = false;
            return;
        }
        isTouched = isMoved = false;
    
        var currentPos;
        if (s.params.followFinger) {
            currentPos = s.rtl ? s.translate : -s.translate;
        }
        else {
            currentPos = -currentTranslate;
        }
    
        // Find current slide
        var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
        for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
            if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                    stopIndex = i;
                    groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                }
            }
            else {
                if (currentPos >= s.slidesGrid[i]) {
                    stopIndex = i;
                    groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                }
            }
        }
    
        // Find current slide size
        var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
    
        if (timeDiff > s.params.longSwipesMs) {
            // Long touches
            if (!s.params.longSwipes) {
                s.slideTo(s.activeIndex);
                return;
            }
            if (s.swipeDirection === 'next') {
                if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                else s.slideTo(stopIndex);
    
            }
            if (s.swipeDirection === 'prev') {
                if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                else s.slideTo(stopIndex);
            }
        }
        else {
            // Short swipes
            if (!s.params.shortSwipes) {
                s.slideTo(s.activeIndex);
                return;
            }
            if (s.swipeDirection === 'next') {
                s.slideTo(stopIndex + s.params.slidesPerGroup);
    
            }
            if (s.swipeDirection === 'prev') {
                s.slideTo(stopIndex);
            }
        }
    };
    /*=========================
      Transitions
      ===========================*/
    s._slideTo = function (slideIndex, speed) {
        return s.slideTo(slideIndex, speed, true, true);
    };
    s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        if (typeof slideIndex === 'undefined') slideIndex = 0;
        if (slideIndex < 0) slideIndex = 0;
        s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
        if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
    
        var translate = - s.snapGrid[s.snapIndex];
        // Stop autoplay
        if (s.params.autoplay && s.autoplaying) {
            if (internal || !s.params.autoplayDisableOnInteraction) {
                s.pauseAutoplay(speed);
            }
            else {
                s.stopAutoplay();
            }
        }
    
        // Normalize slideIndex
        for (var i = 0; i < s.slidesGrid.length; i++) {
            if (- Math.floor(translate * 100) >= Math.floor(s.slidesGrid[i] * 100)) {
                slideIndex = i;
            }
        }
    
        // Directions locks
        if (!s.params.allowSwipeToNext && translate < s.translate && translate < s.minTranslate()) {
            return false;
        }
        if (!s.params.allowSwipeToPrev && translate > s.translate && translate > s.maxTranslate()) {
            if ((s.activeIndex || 0) !== slideIndex ) return false;
        }
    
        // Update Index
        if (typeof speed === 'undefined') speed = s.params.speed;
        s.previousIndex = s.activeIndex || 0;
        s.activeIndex = slideIndex;
    
        if ((s.rtl && -translate === s.translate) || (!s.rtl && translate === s.translate)) {
            // Update Height
            s.updateClasses();
            return false;
        }
        s.updateClasses();
        s.onTransitionStart(runCallbacks);
    
        if (speed === 0) {
            s.setWrapperTranslate(translate);
            s.setWrapperTransition(0);
            s.onTransitionEnd(runCallbacks);
        }
        else {
            s.setWrapperTranslate(translate);
            s.setWrapperTransition(speed);
            if (!s.animating) {
                s.animating = true;
                s.wrapper.transitionEnd(function () {
                    if (!s) return;
                    s.onTransitionEnd(runCallbacks);
                });
            }
    
        }
    
        return true;
    };
    
    s.onTransitionStart = function (runCallbacks) {
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        if (runCallbacks) {
            s.emit('onTransitionStart', s);
            if (s.activeIndex !== s.previousIndex) {
                s.emit('onSlideChangeStart', s);
                if (s.activeIndex > s.previousIndex) {
                    s.emit('onSlideNextStart', s);
                }
                else {
                    s.emit('onSlidePrevStart', s);
                }
            }
    
        }
    };
    s.onTransitionEnd = function (runCallbacks) {
        s.animating = false;
        s.setWrapperTransition(0);
        if (typeof runCallbacks === 'undefined') runCallbacks = true;
        if (runCallbacks) {
            s.emit('onTransitionEnd', s);
            if (s.activeIndex !== s.previousIndex) {
                s.emit('onSlideChangeEnd', s);
                if (s.activeIndex > s.previousIndex) {
                    s.emit('onSlideNextEnd', s);
                }
                else {
                    s.emit('onSlidePrevEnd', s);
                }
            }
        }
        if (s.params.hashnav && s.hashnav) {
            s.hashnav.setHash();
        }
    
    };
    s.slideNext = function (runCallbacks, speed, internal) {
        if (s.params.loop) {
            if (s.animating) return false;
            s.fixLoop();
            var clientLeft = s.container[0].clientLeft;
            return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        }
        else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
    };
    s._slideNext = function (speed) {
        return s.slideNext(true, speed, true);
    };
    s.slidePrev = function (runCallbacks, speed, internal) {
        if (s.params.loop) {
            if (s.animating) return false;
            s.fixLoop();
            var clientLeft = s.container[0].clientLeft;
            return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        }
        else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
    };
    s._slidePrev = function (speed) {
        return s.slidePrev(true, speed, true);
    };
    s.slideReset = function (runCallbacks, speed, internal) {
        return s.slideTo(s.activeIndex, speed, runCallbacks);
    };
    
    /*=========================
      Translate/transition helpers
      ===========================*/
    s.setWrapperTransition = function (duration, byController) {
        s.wrapper.transition(duration);
        s.emit('onSetTransition', s, duration);
    };
    s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
        var x = 0, y = 0, z = 0;
        if (s.isHorizontal()) {
            x = s.rtl ? -translate : translate;
        }
        else {
            y = translate;
        }
    
        if (s.params.roundLengths) {
            x = round(x);
            y = round(y);
        }
    
        if (!s.params.virtualTranslate) {
            if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
            else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
        }
    
        s.translate = s.isHorizontal() ? x : y;
    
        // Check if we need to update progress
        var progress;
        var translatesDiff = s.maxTranslate() - s.minTranslate();
        if (translatesDiff === 0) {
            progress = 0;
        }
        else {
            progress = (translate - s.minTranslate()) / (translatesDiff);
        }
    
        if (updateActiveIndex) s.updateActiveIndex();
        s.emit('onSetTranslate', s, s.translate);
    };
    
    s.getTranslate = function (el, axis) {
        var matrix, curTransform, curStyle, transformMatrix;
    
        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = 'x';
        }
    
        if (s.params.virtualTranslate) {
            return s.rtl ? -s.translate : s.translate;
        }
    
        curStyle = window.getComputedStyle(el, null);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(',').length > 6) {
                curTransform = curTransform.split(', ').map(function(a){
                    return a.replace(',','.');
                }).join(', ');
            }
            // Some old versions of Webkit choke when 'none' is passed; pass
            // empty string instead in this case
            transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
        }
        else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
            matrix = transformMatrix.toString().split(',');
        }
    
        if (axis === 'x') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m41;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[12]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[4]);
        }
        if (axis === 'y') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m42;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[13]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[5]);
        }
        if (s.rtl && curTransform) curTransform = -curTransform;
        return curTransform || 0;
    };
    s.getWrapperTranslate = function (axis) {
        if (typeof axis === 'undefined') {
            axis = s.isHorizontal() ? 'x' : 'y';
        }
        return s.getTranslate(s.wrapper[0], axis);
    };
    
    /*=========================
      Loop
      ===========================*/
    // Create looped slides
    s.createLoop = function () {
        // Remove duplicated slides
        s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
    
        var slides = s.wrapper.children('.' + s.params.slideClass);
    
        if(s.params.slidesPerView === 'auto' && !s.params.loopedSlides) s.params.loopedSlides = slides.length;
    
        s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
        s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
        if (s.loopedSlides > slides.length) {
            s.loopedSlides = slides.length;
        }
    
        var prependSlides = [], appendSlides = [], i;
        slides.each(function (index, el) {
            var slide = $(this);
            if (index < s.loopedSlides) appendSlides.push(el);
            if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
            slide.attr('data-swiper-slide-index', index);
        });
        for (i = 0; i < appendSlides.length; i++) {
            s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
        }
        for (i = prependSlides.length - 1; i >= 0; i--) {
            s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
        }
    };
    s.destroyLoop = function () {
        s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        s.slides.removeAttr('data-swiper-slide-index');
    };
    s.reLoop = function (updatePosition) {
        var oldIndex = s.activeIndex - s.loopedSlides;
        s.destroyLoop();
        s.createLoop();
        s.updateSlidesSize();
        if (updatePosition) {
            s.slideTo(oldIndex + s.loopedSlides, 0, false);
        }
    
    };
    s.fixLoop = function () {
        var newIndex;
        //Fix For Negative Oversliding
        if (s.activeIndex < s.loopedSlides) {
            newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
            newIndex = newIndex + s.loopedSlides;
            s.slideTo(newIndex, 0, false, true);
        }
        //Fix For Positive Oversliding
        else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
            newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
            newIndex = newIndex + s.loopedSlides;
            s.slideTo(newIndex, 0, false, true);
        }
    };
    /*=========================
      Events/Callbacks/Plugins Emitter
      ===========================*/
    function normalizeEventName (eventName) {
        if (eventName.indexOf('on') !== 0) {
            if (eventName[0] !== eventName[0].toUpperCase()) {
                eventName = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
            }
            else {
                eventName = 'on' + eventName;
            }
        }
        return eventName;
    }
    s.emitterEventListeners = {
    
    };
    s.emit = function (eventName) {
        // Trigger callbacks
        if (s.params[eventName]) {
            s.params[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        }
        var i;
        // Trigger events
        if (s.emitterEventListeners[eventName]) {
            for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                s.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            }
        }
    };
    s.on = function (eventName, handler) {
        eventName = normalizeEventName(eventName);
        if (!s.emitterEventListeners[eventName]) s.emitterEventListeners[eventName] = [];
        s.emitterEventListeners[eventName].push(handler);
        return s;
    };
    s.off = function (eventName, handler) {
        var i;
        eventName = normalizeEventName(eventName);
        if (typeof handler === 'undefined') {
            // Remove all handlers for such event
            s.emitterEventListeners[eventName] = [];
            return s;
        }
        if (!s.emitterEventListeners[eventName] || s.emitterEventListeners[eventName].length === 0) return;
        for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
            if(s.emitterEventListeners[eventName][i] === handler) s.emitterEventListeners[eventName].splice(i, 1);
        }
        return s;
    };
    s.once = function (eventName, handler) {
        eventName = normalizeEventName(eventName);
        var _handler = function () {
            handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            s.off(eventName, _handler);
        };
        s.on(eventName, _handler);
        return s;
    };

    /*=========================
      Init/Destroy
      ===========================*/
    s.init = function () {
        if (s.params.loop) s.createLoop();
        s.updateContainerSize();
        s.updateSlidesSize();
        s.updatePagination();
        if (s.params.scrollbar && s.scrollbar) {
            s.scrollbar.set();
            if (s.params.scrollbarDraggable) {
                s.scrollbar.enableDraggable();
            }
        }
        if (s.params.loop) {
            s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
        }
        else {
            s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
        }
        s.attachEvents();
        if (s.params.autoplay) {
            s.startAutoplay();
        }
        if (s.params.hashnav) {
            if (s.hashnav) s.hashnav.init();
        }
        s.emit('onInit', s);
    };
    
    // Cleanup dynamic styles
    s.cleanupStyles = function () {
        // Container
        s.container.removeClass(s.classNames.join(' ')).removeAttr('style');
    
        // Wrapper
        s.wrapper.removeAttr('style');
    
        // Slides
        if (s.slides && s.slides.length) {
            s.slides
                .removeClass([
                  s.params.slideVisibleClass,
                  s.params.slideActiveClass,
                  s.params.slideNextClass,
                  s.params.slidePrevClass
                ].join(' '))
                .removeAttr('style')
                .removeAttr('data-swiper-column')
                .removeAttr('data-swiper-row');
        }
    
        // Pagination/Bullets
        if (s.paginationContainer && s.paginationContainer.length) {
            s.paginationContainer.removeClass(s.params.paginationHiddenClass);
        }
        if (s.bullets && s.bullets.length) {
            s.bullets.removeClass(s.params.bulletActiveClass);
        }
    
        // Buttons
        if (s.params.prevButton) $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
        if (s.params.nextButton) $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
    
        // Scrollbar
        if (s.params.scrollbar && s.scrollbar) {
            if (s.scrollbar.track && s.scrollbar.track.length) s.scrollbar.track.removeAttr('style');
            if (s.scrollbar.drag && s.scrollbar.drag.length) s.scrollbar.drag.removeAttr('style');
        }
    };
    
    // Destroy
    s.destroy = function (deleteInstance, cleanupStyles) {
        // Detach evebts
        s.detachEvents();
        // Stop autoplay
        s.stopAutoplay();
        // Disable draggable
        if (s.params.scrollbar && s.scrollbar) {
            if (s.params.scrollbarDraggable) {
                s.scrollbar.disableDraggable();
            }
        }
        // Destroy loop
        if (s.params.loop) {
            s.destroyLoop();
        }
        // Cleanup styles
        if (cleanupStyles) {
            s.cleanupStyles();
        }
        // Destroy callback
        s.emit('onDestroy');
        // Delete instance
        if (deleteInstance !== false) s = null;
    };
    
    s.init();
    


    // Return swiper instance
    return s;
};

/*==================================================
    Prototype
====================================================*/
Swiper.prototype = {
    /*==================================================
    Browser
    ====================================================*/
    browser: {
        ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
        ieTouch: (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 1) || (window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1)
    },
    /*==================================================
    Devices
    ====================================================*/
    device: (function () {
        var ua = navigator.userAgent;
        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        return {
            ios: ipad || iphone || ipod,
            android: android
        };
    })(),
    /*==================================================
    Feature Detection
    ====================================================*/
    support: {
        touch : (window.Modernizr && Modernizr.touch === true) || (function () {
            return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        })(),

        transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
            var div = document.createElement('div').style;
            return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
        })(),

        flexbox: (function () {
            var div = document.createElement('div').style;
            var styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
            for (var i = 0; i < styles.length; i++) {
                if (styles[i] in div) return true;
            }
        })(),
    },
};
