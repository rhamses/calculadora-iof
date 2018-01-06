var IOF = function(options, callback){
  var ajax = new ambAjax();
  if (options.hasOwnProperty("purchase") && options.hasOwnProperty("currency")) {
    var IOF = this;
    IOF.value = options.purchase;
    IOF.currency = options.currency;
    IOF.taxCard = (6.38/100);
    IOF.taxMoney = (1.1/100);
    IOF.callback = callback;
    IOF.url = api.currencyURL + IOF.currency;

    ajax.get(IOF.url, function(response){
      if (response.hasOwnProperty("body")) {
        var res = response.body[0];
        var credCardOptions = {
          rate: res.rate,
          rate_date: res.rate_date,
          userValue: IOF.value,
          tax: IOF.taxCard
        }
        var moneyOptions = {
          rate: res.rate,
          rate_date: res.rate_date,
          userValue: IOF.value,
          tax: IOF.taxMoney
        }
        var callbackOpt = {
          credCard: IOF.Calculation(credCardOptions),
          moneyOpt: IOF.Calculation(moneyOptions),
          currencyName: res.currency_name
        }
        IOF.callback(callbackOpt);
      }
    });
  } else {
    console.log('deu erro');
  }
}

IOF.prototype.Calculation = function(options) {
  var currency = options.userValue,
  exchangeRate = options.rate,
  exchangeDate = options.rate_date,
  tax = options.tax,
  iof_total = '',
  value_total = '',
  total = '',
  response = {};

  iof_total = (currency  * exchangeRate) * tax;
  value_total = currency  * exchangeRate;
  total = iof_total + value_total;
  response = {};

  response['iof'] = iof_total.toFixed(2);
  response['iof_value'] = value_total.toFixed(2);
  response['iof_value_total'] = total.toFixed(2);
  response['exchange_date'] = exchangeDate;
  response['exchange_rate'] = exchangeRate;

  return response;
}