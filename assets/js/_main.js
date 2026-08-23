/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

// Determine the expected state of the theme toggle, which can be "dark", "light", or
// "system". Default is "system".
let determineThemeSetting = () => {
  let themeSetting = localStorage.getItem("theme");
  return (themeSetting != "dark" && themeSetting != "light" && themeSetting != "system") ? "system" : themeSetting;
};

const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// Determine the computed theme, which can be "dark" or "light". If the theme setting is
// "system", the computed theme is determined based on the user's system preference.
let determineComputedTheme = () => {
  let themeSetting = determineThemeSetting();
  if (themeSetting != "system") {
    return themeSetting;
  }
  return darkModePreference.matches ? "dark" : "light";
};

let updateThemeControls = (theme) => {
  const isDark = theme === "dark";
  const themeButton = document.getElementById("theme-toggle-button");
  const themeIcon = document.getElementById("theme-icon");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  if (themeIcon) {
    themeIcon.classList.toggle("fa-moon", isDark);
    themeIcon.classList.toggle("fa-sun", !isDark);
  }

  if (themeButton) {
    const label = isDark ? "Switch to light theme" : "Switch to dark theme";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.setAttribute("title", label);
  }

  if (themeColor) {
    themeColor.setAttribute("content", isDark ? "#4a4a3a" : "#f0eee9");
  }
};

// Set the theme on page load or when explicitly called
let setTheme = (theme) => {
  const requestedTheme =
    theme ||
    localStorage.getItem("theme") ||
    $("html").attr("data-theme") ||
    "system";
  const computedTheme = requestedTheme === "system"
    ? (darkModePreference.matches ? "dark" : "light")
    : requestedTheme;

  if (computedTheme === "dark") {
    $("html").attr("data-theme", "dark");
  } else {
    $("html").removeAttr("data-theme");
  }

  updateThemeControls(computedTheme);
  return computedTheme;
};

// Toggle the theme manually with icon animation
var toggleTheme = () => {
  const icon = document.getElementById('theme-icon');
  const currentTheme = $("html").attr("data-theme") === "dark" ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  if (!icon || reducedMotionPreference.matches) {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    return;
  }

  icon.classList.add('theme-icon-out');

  setTimeout(() => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);

    icon.classList.remove('theme-icon-out');
    icon.classList.add('theme-icon-in');

    setTimeout(() => {
      icon.classList.remove('theme-icon-in');
    }, 400);
  }, 200);
};

/* ==========================================================================
   Plotly integration script so that Markdown codeblocks will be rendered
   ========================================================================== */

// Read the Plotly data from the code block, hide it, and render the chart as new node. This allows for the 
// JSON data to be retrieve when the theme is switched. The listener should only be added if the data is 
// actually present on the page.
import { plotlyDarkLayout, plotlyLightLayout } from './theme.js';
let plotlyElements = document.querySelectorAll("pre>code.language-plotly");
if (plotlyElements.length > 0) {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      plotlyElements.forEach((elem) => {
        // Parse the Plotly JSON data and hide it
        var jsonData = JSON.parse(elem.textContent);
        elem.parentElement.classList.add("hidden");

        // Add the Plotly node
        let chartElement = document.createElement("div");
        elem.parentElement.after(chartElement);

        // Set the theme for the plot and render it
        const theme = (determineComputedTheme() === "dark") ? plotlyDarkLayout : plotlyLightLayout;
        if (jsonData.layout) {
          jsonData.layout.template = (jsonData.layout.template) ? { ...theme, ...jsonData.layout.template } : theme;
        } else {
          jsonData.layout = { template: theme };
        }
        Plotly.react(chartElement, jsonData.data, jsonData.layout);
      });
    }
  });
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

$(document).ready(function () {
  // SCSS SETTINGS - These should be the same as the settings in the relevant files 
  const scssLarge = 925;          // pixels, from /_sass/_themes.scss
  const scssMastheadHeight = 70;  // pixels, from the current theme (e.g., /_sass/theme/_default.scss)

  // If the user hasn't chosen a theme, follow the OS preference
  setTheme();
  darkModePreference.addEventListener("change", (e) => {
    if (determineThemeSetting() === "system") {
      setTheme(e.matches ? "dark" : "light");
    }
  });

  // Enable the theme toggle
  $('[data-theme-toggle]').on('click', toggleTheme);

  // Keep the priority-navigation disclosure state available to assistive technology.
  const $navToggle = $('[data-nav-toggle]');
  const $hiddenNavLinks = $('#site-nav-hidden-links');
  const closeNavDisclosure = () => {
    $hiddenNavLinks.addClass('hidden');
    $navToggle.removeClass('close').attr('aria-expanded', 'false').trigger('focus');
  };
  const syncNavDisclosure = () => {
    const isExpanded = !$navToggle.hasClass('hidden') && !$hiddenNavLinks.hasClass('hidden');
    $navToggle.attr('aria-expanded', String(isExpanded));
  };
  $navToggle.on('click', syncNavDisclosure);
  $navToggle.on('keydown', function (event) {
    if (event.key === 'Escape' && $(this).attr('aria-expanded') === 'true') {
      closeNavDisclosure();
    }
  });
  $hiddenNavLinks.on('keydown', function (event) {
    if (event.key === 'Escape') {
      closeNavDisclosure();
    }
  });
  $(window).on('resize', syncNavDisclosure);
  if (window.screen.orientation) {
    window.screen.orientation.addEventListener('change', syncNavDisclosure);
  }
  $hiddenNavLinks.on('click', 'a', function () {
    $hiddenNavLinks.addClass('hidden');
    $navToggle.removeClass('close').attr('aria-expanded', 'false');
  });
  syncNavDisclosure();

  // Enable the sticky footer
  var bumpIt = function () {
    $("body").css("margin-bottom", $(".page__footer").outerHeight(true));
  }
  $(window).resize(function () {
    didResize = true;
  });
  setInterval(function () {
    if (didResize) {
      didResize = false;
      bumpIt();
    }}, 250);
  var didResize = false;
  bumpIt();

  // FitVids init
  fitvids();

  // Contact menu disclosure
  const $contactToggle = $("[data-contact-toggle]");
  const $contactLinks = $("#author-contact-links");
  const closeContactDisclosure = () => {
    $contactToggle.attr("aria-expanded", "false").removeClass("open").trigger("focus");
    $contactLinks.stop(true, true).hide();
  };
  $contactToggle.on("click", function () {
    const willExpand = $(this).attr("aria-expanded") !== "true";
    $(this).attr("aria-expanded", String(willExpand)).toggleClass("open", willExpand);
    $contactLinks.stop(true, true);
    if (reducedMotionPreference.matches) {
      $contactLinks.toggle(willExpand);
    } else if (willExpand) {
      $contactLinks.fadeIn("fast");
    } else {
      $contactLinks.fadeOut("fast");
    }
  });
  $contactToggle.on("keydown", function (event) {
    if (event.key === "Escape" && $(this).attr("aria-expanded") === "true") {
      closeContactDisclosure();
    }
  });
  $contactLinks.on("keydown", function (event) {
    if (event.key === "Escape") {
      closeContactDisclosure();
    }
  });

  // Keep the responsive contact disclosure and its state synchronized.
  const syncContactDisclosure = () => {
    if ($(window).width() >= scssLarge) {
      $contactLinks.stop(true, true).css("display", "block");
      $contactToggle.attr("aria-expanded", "false").removeClass("open");
    } else if ($contactToggle.attr("aria-expanded") !== "true") {
      $contactLinks.stop(true, true).css("display", "none");
    }
  };
  $(window).on('resize', syncContactDisclosure);
  syncContactDisclosure();

  // Scroll the site title to the top without overriding reduced-motion preferences.
  $(".site-title-link").on("click", function (event) {
    const currentPath = window.location.pathname.replace(/\/+$/, "");
    const targetPath = new URL(this.href, window.location.href).pathname.replace(/\/+$/, "");
    if (currentPath === targetPath) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotionPreference.matches ? "auto" : "smooth" });
    }
  });

  // Init smooth scroll, this needs to be slightly more than then fixed masthead height
  if (!reducedMotionPreference.matches) {
    $("a").smoothScroll({
      offset: -scssMastheadHeight,
      preventDefault: false,
    });
  }

});
