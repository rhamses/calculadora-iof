var api = {
  currencyURL: "http://api.calculadoraiof.com.br/v1/rates/",
  countryURL: "http://api.calculadoraiof.com.br/v1/country"
  // currencyURL: "http://localhost/calculadoraiof/api/v1/rates/",
  // countryURL: "http://localhost/calculadoraiof/api/v1/country"
};

var ajax = new ambAjax();

(function() {
  function doMath(btnPurchase, btnCurrency) {
    /**********************************************
    *
    *
    *    Function global variables;
    *
    *
    **********************************************/
    var currency = btnCurrency;
    var purchase = btnPurchase;

    var cardHtml = document.querySelector("#iofCard");
    var btnCountries = document.querySelector("#dropdownMenu1");
    var moneyHtml = document.querySelector("#iofMoney");
    var resultPanel = document.querySelector("#resultPanel");
    var resultPanelBody = document.querySelector(".panel-result-wrapper");

    if (purchase.length == 0) {
      /**********************************************
      *
      *
      *    Validates if the text field is empty
      *    and throw an html message if it is.
      *    also, sending an event error to GA.
      *    
      *
      **********************************************/
      var el = document.querySelector("#app-wrapper");
      el.insertAdjacentHTML(
        "afterbegin",
        '<div id="warning" class="alert alert-danger"><p>Preencha o campo do valor a ser convertido aqui embaixo, senão não funciona ;) </p></div>'
      );
      var timeout = window.setTimeout(function() {
        var warning = document.querySelector("#warning");
        warning.className = warning.className + " hide";
      }, 3000);
      ga("send", "event", "Exchange Button", "Quota Failed");
    } else {
      /**********************************************
      *
      *
      *    If it has value ont the text field
      *    then takes it and set a default 
      *    exchange value (kind of workaround it'll
      *    be fixed later.)
      *    
      *
      **********************************************/

      resultPanel.className = resultPanel.className.replace("hide", "");

      var iof = new IOF(
        {
          purchase: purchase,
          currency: currency
        },
        function(response) {
          // plot data on HTML
          if (response.hasOwnProperty("credCard")) {
            cardHtml.innerHTML = doTheHtml(response.credCard);
          }
          if (response.hasOwnProperty("moneyOpt")) {
            moneyHtml.innerHTML = doTheHtml(response.moneyOpt);
          }
          // put sharing warning
          var div = document.querySelector(".result-msg");
          var url =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?c=" +
            currency +
            "&v=" +
            purchase;
          div.innerHTML =
            '<p class="text-center"><button id="shareButton" type="button" class="btn btn-primary" data-clipboard-text="' +
            url +
            '">Quer mostrar para seus amigos essa consulta de valor? Clique aqui e copie o link</button></p>';
          console.log(currency, response.currencyName);
          ga(
            "send",
            "event",
            "Exchange Button",
            "Quota Sucessful",
            response.currencyName,
            purchase
          );
        }
      );
    }
  }

  function doTheHtml(obj) {
    /**********************************************
    *
    *
    *        Exchange Rate Header Information
    *
    *
    **********************************************/
    var resultTitle = document.querySelector("#resultTitle");
    resultTitle.innerHTML =
      "O valor estimado da conversão é de: R$ " +
      parseFloat(obj.exchange_rate).toFixed(2);
    /**********************************************
    *
    *
    *        Credcard and Money Body info
    *
    *
    **********************************************/
    var html = '<table class="table table-striped result-list">';
    html += "<tr>";
    html +=
      '<td class="td-label">O valor convertido com a cotação de hoje é:</td>';
    html += "<td><strong> R$ " + obj.iof_value + "</strong></td>";
    html += "</tr><tr>";
    html +=
      '<td class="td-label">O IOF que incide sobre o valor acima é de:</td>';
    html += "<td><strong> R$ " + obj.iof + "</strong></td>";
    html += "</tr><tr>";
    html += '<td class="td-label">Total dos valores é de:</td>';
    html += "<td><strong> R$ " + obj.iof_value_total + "</strong></td>";
    html += "</tr>";
    html += "</table>";
    return html;
  }

  function changeDropdown() {
    var dropdown = document.querySelector("input[name=rdCurrency]:checked");
    var btnCountries = document.querySelector("#dropdownMenu1");
    dropdown.value = this.dataset.code;
    dropdown.dataset.country = this.dataset.country;
    btnCountries.innerText = this.innerText;
    dropdown.parentElement.previousElementSibling.className = this.children[0].className;
  }

  function filterCountriesDropdown(item) {
    var dropdown = document.querySelector("#countryDropdown");
    var dropdownChildrens = Array.prototype.slice.call(
      dropdown.querySelectorAll("li")
    );
    var countryLI = document.createElement("li");
    var countryLink = document.createElement("a");

    if (item.cabbr) {
      var flag = "flag-icon-" + item.cabbr.toLowerCase();
      var flagName = item.cabbr.toLowerCase();
    } else {
      var flag = "flag-icon-un";
      var flagName = item.country_code;
    }

    countryLink.addEventListener("click", changeDropdown);
    countryLink.innerHTML =
      '<span class="flag-icon ' + flag + '"></span> ' + item.country;
    countryLink.dataset.code = item.country_code;
    countryLink.className = "country--item";
    countryLink.dataset.country = flagName;

    countryLI.appendChild(countryLink);
    dropdown.appendChild(countryLI);
  }

  function removeCountriesDropdown() {
    var dropdown = document.querySelector("#countryDropdown");
    var dropdownChildrens = Array.prototype.slice.call(
      dropdown.querySelectorAll("li")
    );
    if (dropdownChildrens.length > 1) {
      dropdownChildrens.forEach(function(item, index) {
        if (index != 0) {
          dropdown.removeChild(item);
        }
      });
    }
  }

  function hasQueryString() {
    if (window.location.search.length > 0) {
      var q = window.location.search.substr(1).split("&");
      var response = {};
      q.map(function(item) {
        if (/^(c=)/.test(item) && Number.isInteger(parseInt(item.substr(2)))) {
          response.currency = parseInt(item.substr(2));
        }
        if (/^(v=)/.test(item) && Number.isInteger(parseInt(item.substr(2)))) {
          response.value = parseFloat(item.substr(2));
        }
      }, q);
      return response;
    } else {
      return false;
    }
  }

  /**********************************************
*
*
*        Global Variables
*
*
**********************************************/
  var btnConvert = document.querySelector("#btnConvert");
  var currencies = document.querySelectorAll("input[type=radio]");
  var btnCountries = document.querySelector("#dropdownMenu1");
  var txtAutocomplete = document.querySelector("#txtAutocomplete");
  var searchArray = [];

  new Clipboard("#shareButton");

  /**********************************************
*
*
*       Submit the form and make magic
*
*
**********************************************/
  btnConvert.addEventListener("click", function() {
    var btnPurchase = document.querySelector("#txtIof").value;
    var btnCurrency = document.querySelector("input[name=rdCurrency]:checked")
      .value;
    doMath(btnPurchase, btnCurrency);
  });

  /**********************************************
*
*
*       Do the behaviour of transform
*       a radio input into a dropdown
*
*
**********************************************/
  currencies = Array.prototype.slice.call(currencies);
  currencies.forEach(function(el, index) {
    el.addEventListener("change", function() {
      if (el.className == "oth") {
        $(".dropdown-toggle").dropdown("toggle");
        el.nextSibling.nodeValue = "";
        btnCountries.className = btnCountries.className.replace("hide", "");
      } else {
        if (btnCountries.className.search(/hide/) == -1) {
          var radioOther = document.querySelector("#other");
          btnCountries.className = btnCountries.className + " hide";
          radioOther.parentElement.previousElementSibling.className =
            "flag-icon flag-icon-un";
          radioOther.nextSibling.nodeValue = "Outra Moeda";
          btnCountries.innerText = "Outra Moeda";
        }
      }
    });
  });
  /**********************************************
*
*
*        Loading Flags over API
*
*
**********************************************/
  ajax.get(api.countryURL, function(response) {
    searchArray = response;
    for (var i = 0; i < response.length; i++) {
      filterCountriesDropdown(response[i]);
    }
  });
  /***********************x***********************
*
*
*        Autocomplete Function
*
*
**********************************************/
  txtAutocomplete.addEventListener("keyup", function() {
    var value = this.value;
    var regex = new RegExp(
      Slugify(value).split("").join("\\w*").replace(/\W/, ""),
      "i"
    );
    var results = searchArray.filter(function(item) {
      if (item.country.match(regex) || item.currency_name.match(regex)) {
        return item;
      }
    });
    removeCountriesDropdown();
    results.forEach(function(item, index) {
      filterCountriesDropdown(item);
    });
  });
  /**********************************************
*
*
*        SLUGIFY
*
*
**********************************************/
  var Slugify = function(rawText) {
    var regex = /([\xE0-\xE6])|([\xE8-\xEB])|([\xEC-\xEF])|([\xF2-\xF6])|([\xF9-\xFC])|(\xE7)|(\xF1)/g;
    var convertedText = rawText.toLowerCase();
    return convertedText.replace(regex, function(
      matchs,
      g1,
      g2,
      g3,
      g4,
      g5,
      g6,
      g7
    ) {
      if (g1) {
        return "a";
      } else if (g2) {
        return "e";
      } else if (g3) {
        return "i";
      } else if (g4) {
        return "o";
      } else if (g5) {
        return "u";
      } else if (g6) {
        return "c";
      } else if (g7) {
        return "n";
      }
    });
  };
  /**********************************************
*
*
*    Get Query Strings
*
*
**********************************************/
  if ((qs = hasQueryString())) {
    // get query string values
    var qsPurchase = qs.value;
    var qsCurrency = qs.currency;
    // set values to the UI
    document.querySelector("#txtIof").value = qsPurchase;
    document.querySelectorAll(
      'input[value="' + qsCurrency + '"]'
    )[0].checked = true;
    // call the main function
    doMath(qsPurchase, qsCurrency);
  }
})();
