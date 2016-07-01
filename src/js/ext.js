(function(){
'use strict';
var $ = window.Dom7;
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var contents = {};
function getContent(page) {
  var name = page.props.name;
  var c = contents[name];
  if (!c) {
    c = $('.page[data-page="' + page.props.name + '"] .page-content');
    contents[name] = c;
  }
  return c;
}
$.getContent = getContent;

function saveContext(page) {
  // getContent(page).scrollTop() always 0 if fromPage is another view,
  // then we use page.savedScrollTop_ saved on
  // $(`.tab-link[href="#${viewName}"]`).click before fromPage inactivated.
  var id = page.state.query ? page.state.query.id : undefined;
  page.savedScrollTop = Object.assign(page.savedScrollTop || {}, _defineProperty({}, id, page.savedScrollTop_ || getContent(page).scrollTop()));
  page.savedScrollTop_ = null;
  if (page.refs.vlist) {
    page.savedVlistItems = page.refs.vlist.list.items;
    page.savedVlistMidIndex = Math.round((page.refs.vlist.list.currentToIndex + page.refs.vlist.list.currentFromIndex) / 2);
    page.refs.vlist.deleteAllItems();
  }
}

function restoreContext(page) {
  var c = getContent(page);
  var s = c[0].f7ScrollToolbarsHandler;
  // disable toolbar scroll handler so that bars not hidden when restore virtual list
  if (s) c.off('scroll', s);
  if (page.refs.vlist) {
    if (page.refs.vlist.isEmpty()) {
      if (page.savedVlistItems) {
        page.refs.vlist.replaceAllItems(page.savedVlistItems);
        // do this first, otherwise, below c.scrollTop does not work correctly
        page.refs.vlist.scrollToItem(page.savedVlistMidIndex);
      }
    }
  }
  var id = page.state.query ? page.state.query.id : undefined;
  var top = page.savedScrollTop ? page.savedScrollTop[id] || 0 : 0;
  if (top >= 0) c.scrollTop(top); // must top == 0 also
  if (s) setTimeout(function () {
    return c.on('scroll', s);
  }, 1000);
}

var pageInited = {};
function checkPageBeforeAnimationIn(page) {
  document.title = window.APP_LONG_TITLE;
  if (page.pageBeforeAnimationIn) {
    page.pageBeforeAnimationIn();
  }
  // in case delayed function called in page.pageBeforeAnimationIn,
  // so we delay restoreContext to wait for it.
  setTimeout(function () {
    return restoreContext(page);
  });
}

var activeView = void 0;
var pageComponents = {};

function pageChanged(name, pageAfterAnimation) {
  var fromPage = pageComponents[name];
  if (!fromPage) return;
  if (pageAfterAnimation) {
    if (!fromPage.state.active) return;
    saveContext(fromPage);
    if (fromPage.pageAfterAnimationOut) {
      fromPage.pageAfterAnimationOut();
    }
    fromPage.setState({ active: false });
  } else if (fromPage.pageBeforeAnimationOut) {
    fromPage.pageBeforeAnimationOut();
  }
}

function mixinView(viewName) {
  return {
    componentDidMount: function componentDidMount() {
      var _this = this;

      // make fromPage still active before Animated done for better transimition effect
      var checkActivePage = function checkActivePage(e, pageAfterAnimation) {
        var page = pageComponents[e.detail.page.name];
        // must update this on v1.4.0, f7page in pageInit() is obsolete
        page.f7page = e.detail.page;
        if (pageAfterAnimation) {
          if (!page.state.active) {
            page.setState({ active: true, query: e.detail.page.query }, function () {
              checkPageBeforeAnimationIn(page);
              if (page.pageAfterAnimationIn) {
                page.pageAfterAnimationIn();
              }
            });
          } else {
            if (page.pageAfterAnimationIn) {
              page.pageAfterAnimationIn();
            }
          }
        } else {
          if (!page.state.active) {
            page.setState({ active: true, query: e.detail.page.query }, function () {
              checkPageBeforeAnimationIn(page);
            });
          } else {
            console.log('assert(pageBeforeAnimation page is supposed to be inactive)');
          }
        }

        pageChanged((e.detail.page.fromPage || {}).name, pageAfterAnimation);
      };
      $('#' + viewName).on('pageBeforeAnimation', checkActivePage);
      $('#' + viewName).on('pageAfterAnimation', function (e) {
        return checkActivePage(e, true);
      });
      $('#' + viewName).on('swipeBackBeforeChange', function (e) {
        pageChanged($(e.detail.activePage).attr('data-page'), true);
      });
      $('#' + viewName).on('pageInit', function (e) {
        var name = e.detail.page.name;
        var page = _this;
        name.split('-').forEach(function (n) {
          page = page && page.refs[n];
        });
        if (!page) return;
        pageComponents[name] = page;
        if (!pageInited[name]) {
          (function () {
            if (page.pageInit) page.pageInit();
            pageInited[name] = true;
            var up = page.componentDidUpdate;
            page.componentDidUpdate = function (a, b) {
              if (up) up.apply(page, [a, b]);
              if (page.state.active) $.lazyHandler();
            };
            getContent(page).on('scroll', $.lazyHandler);
          })();
        }
        page.f7page = e.detail.page;
      });
      $('.tab-link[href="#' + viewName + '"]').click(function () {
        activeView = $.app.getCurrentView();
        var p = pageComponents[activeView.activePage.name];
        p.savedScrollTop_ = getContent(p).scrollTop();
      });
      $('#' + viewName).on('show', function () {
        // triggered in app.showTab
        var fromPage = activeView && activeView.activePage;
        activeView = $.app.getCurrentView();
        var page = activeView.activePage;
        page.fromPage = fromPage;
        if (fromPage) {
          // hack, better put in f7 showTab itself
          $(fromPage.container).removeClass('page-from-left-to-center');
          window.history.pushState({
            pageName: page.name,
            viewIndex: $.app.views.indexOf(activeView) }, '', $.app.params.pushStateSeparator + '#' + page.name);
        }
        var e = { detail: { page: page } };
        checkActivePage(e, true);
      });
    }
  };
}
$.mixinView = mixinView;
})();
