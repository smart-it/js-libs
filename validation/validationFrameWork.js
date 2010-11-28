
function ajaxRequest(url){
  if (url != null && url != undefined){
    var boleanResult;
    $.ajax({
      type:"GET",
      url: url,
      dataType: "xml",
      async: false,
      success: function(){
        boleanResult =  true;
      },
      error: function(){
        boleanResult = false;
      }
    });
  }
  return boleanResult;
}

function getContentByAjax(url){
  if (url != null && url != undefined){
    var boleanResult;
    $.ajax({
      type:"GET",
      url: url,
      dataType: "xml",
      async: false,
      success: function(){
        boleanResult =  true;
        alert(Data);
        return Data;
      },
      error: function(){
        alert("error");
        return null;
      }
    });
  }
}

function checkEmptyField(inputElement){
  var type = typeof inputElement;
  var value;
  if (type != 'string')  {
    value = $(inputElement).val();
  }
  if(value == undefined || value == null || value == ""){
    return false;
  }
  return true;
}

function greaterZero(inputElement){
  var type = typeof inputElement;
  var value;
  if (type != 'string')  {
    value = $(inputElement).val();
  }
  if (checkEmptyField(inputElement)){
    var intVal = parseFloat(value);
    if (!(intVal > 0)){
      return false;
    }
    return true;
  }
  return false;
}

function greaterThan(inputElement,val){
  var type = typeof inputElement;
  var value;
  if (type != 'string')  {
    value = $(inputElement).val();
  }
  if (checkEmptyField(inputElement)){
    var intVal = parseFloat(value);
    if (!(intVal > parseFloat(val))||value==''){
      return false;
    }
    return true;
  }
  return false;
}

function positive(id){
  var type = typeof id;
  var value;
  if (type != 'string')  {
    value = $(id).val();
  }
  if(value != ''){
    var prcVal = parseFloat(value);
    if(prcVal < 0||value==''){
      return false;
    }
    return true;
  }
  return false;
}

/*
 * To make a number field that do not take any other as input except
 * valid number, just the method in onkeypress event like below
 * 
 * onkeypress="return numberTextField(event,this.getAttribute('id'));"
 */


function numberTextField(e,elementId)
{
  var reg = /[\b0-9]/;
  var  v = document.getElementById(elementId).value;
  if(v.toString().length==0)
  {
    reg = /[\b\.0-9-]/;
  }
  else if(v.toString().indexOf('.')==-1){
    reg = /[\b0-9\.]/;
  }
  else{
    reg = /[\b0-9]/;
  }
  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  if(key==0)
  {
    reg=!reg;
  }
  return reg.test(keychar);
}

function fixedField(e)
{
  var reg = /[.]/;
  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  if(key==0)
  {
    reg = !reg;
  }
  return reg.test(keychar);
}


/*
 * you should write the settings in an array, and
 * send it to fieldvalidation method along with
 * fieldId. This will return a boolean. It returns
 * true is the field is valid and false if invalid.
 * validation rules are limited as follows....
 * 1. validationRule : 'graterThan' -> validate x>value
 *    returns true if x>value, else returns false
 * 2. validationRule : 'graterThanZero',-> x>0
 *    returns true if x>0, else returns false
 * 3. validationRule : 'positive',-> x>=0
 *    returns true if x>=0, else returns false
 * 4. validationRule : 'checkEmptyField'returns false if field is empty.
 * 5. validationRule : 'ajaxRequest'returns false if supplied url is not valid
 *
 * Example:
 *
 * var settings = {
 *    validationRule : 'graterThan',
 *    value : 5,
 *    errorMessage : 'field occurs error',
 *    url:'url supplied'
 * };
 * var cc =  fieldValidate(settings,$(this));
 * finalRet = finalRet && cc;
 */

function doValidation(elem, settings, allSuccess, allFailure) {
  var valid = true;
  for(var i = 0; i < settings.length; ++i) {
    var option = settings[i];
    var setting = jQuery.extend({
      inputId: "", // Particular field id to validate with this setting, supercedes inputClass
      inputClass: "", // A group of inputs' to be validated similarly, it'll be ignored if non-empty name is provided
      params: [], // Arguments to validation funtion, custom or in-built
      vfn: "", // Pre-defined validation function name to be used, if typeof is function work as cfn
      cfn: function(inputControl, params){}, // A custom validation function to register with this which will do the validation
      success: function(inputControl){}, // Success callback
      error: function(inputControl){}, // Error callback
      ajaxFn: "" // A url to which field.val() will be concatenated
    }, option);
    var useId = false;
    if(setting.inputId != null && setting.inputId.length > 0) {
      useId = true;
    }
    if(useId) {
      var thisValid = fieldValidate(setting, $("input#"+setting.inputId));
      valid = valid && thisValid;
      if(thisValid) {
        success($("input#"+setting.inputId));
      }
      else {
        error($("input#"+setting.inputId));
      }
    }
    else {
      var selector = "input."+setting["inputClass"];
      $(selector, $(elem)).each(function(){
        var thisValid = fieldValidate(setting, $(this));
        valid = valid && thisValid;
        if(thisValid) {
          var success = setting["success"];
          success($(this));
        }
        else {
          var error = setting["error"];
          error($(this));
        }
      });
    }
  }
  if(valid) {
    allSuccess($(elem));
  }
  else {
    allFailure($(elem));
  }
  return valid;
}

jQuery.fn.validateNow = function(settings, allSuccess, allFailure) {
  return doValidation($(this), settings, allSuccess, allFailure);
}

jQuery.fn.validateForm = function(settings, allSuccess, allFailure) {
  var elem = $(this);
  $(elem).submit(function(){
    return doValidation(elem, settings, allSuccess, allFailure);
  });
}

function fieldValidate(settings,inputElement){
  if(typeof settings['vfn'] == 'function')  {
    return settings['vfn'](inputElement);
  }
  if(settings['vfn']=='graterThan')
  {
    var ret = greaterThan(inputElement,settings['params'][0]);
    return ret;
  }
  if(settings['vfn']=='graterThanZero')
  {
    ret = greaterZero(inputElement);
    return ret;
  }
  else if(settings['vfn']=='positive'){
    ret = positive(inputElement);
    return ret;
  }
  else if(settings['vfn']=='checkEmptyField'){
    ret = checkEmptyField(inputElement);
    return ret;
  }
  else if(settings['vfn']=='ajaxRequest'){
    ret = ajaxRequest(settings['url']+$(inputElement).val());
    return ret;
  }
  else{
    return false;
  }
}
