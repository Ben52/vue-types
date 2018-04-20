import isPlainObject from 'lodash.isplainobject';
import Vue from 'vue';
var ObjProto = Object.prototype;
var toString = ObjProto.toString;
export var hasOwn = ObjProto.hasOwnProperty;
var FN_MATCH_REGEXP = /^\s*function (\w+)/;
// https://github.com/vuejs/vue/blob/dev/src/core/util/props.js#L177
export var getType = function (fn) {
    var type = (fn !== null && fn !== undefined) ? (fn.type ? fn.type : fn) : null;
    var match = type && type.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
export var getNativeType = function (value) {
    if (value === null || value === undefined)
        return '';
    var match = value.constructor.toString().match(FN_MATCH_REGEXP);
    return match ? match[1] : '';
};
/**
 * No-op function
 */
export var noop = function () { };
/**
 * Checks for a own property in an object
 *
 * @param {object} obj - Object
 * @param {string} prop - Property to check
 */
export var has = function (obj, prop) { return hasOwn.call(obj, prop); };
/**
 * Determines whether the passed value is an integer. Uses `Number.isInteger` if available
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @param {*} value - The value to be tested for being an integer.
 * @returns {boolean}
 */
export var isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
/**
 * Determines whether the passed value is an Array.
 *
 * @param {*} value - The value to be tested for being an array.
 * @returns {boolean}
 */
export var isArray = Array.isArray || function (value) {
    return toString.call(value) === '[object Array]';
};
/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export var isFunction = function (value) { return toString.call(value) === '[object Function]'; };
export var isVueType = function (value) { return isPlainObject(value) && has(value, '_vueTypes_name'); };
export var isPropOptions = function (value) { return isPlainObject(value); };
/**
 * Adds a `def` method to the object returning a new object with passed in argument as `default` property
 *
 * @param {object} type - Object to enhance
 */
export var withDefault = function (type) {
    Object.defineProperty(type, 'def', {
        value: function (def) {
            if (def === undefined && !this.default) {
                return this;
            }
            if (!isFunction(def) && !validateType(this, def)) {
                warn(this._vueTypes_name + " - invalid default value: \"" + def + "\"", def);
                return this;
            }
            this.default = (isArray(def) || isPlainObject(def)) ? function () {
                return def;
            } : def;
            return this;
        },
        enumerable: false,
        writable: false
    });
};
/**
 * Adds a `isRequired` getter returning a new object with `required: true` key-value
 *
 * @param {object} type - Object to enhance
 */
export var withRequired = function (type) {
    Object.defineProperty(type, 'isRequired', {
        get: function () {
            this.required = true;
            return this;
        },
        writable: false,
        enumerable: false
    });
};
/**
 * Adds `isRequired` and `def` modifiers to an object
 *
 * @param {string} name - Type internal name
 * @param {object} obj - Object to enhance
 * @returns {object}
 */
export var toType = function (name, obj) {
    Object.defineProperty(obj, '_vueTypes_name', {
        enumerable: false,
        writable: false,
        value: name
    });
    withRequired(obj);
    withDefault(obj);
    if (isFunction(obj.validator)) {
        obj.validator = obj.validator.bind(obj);
    }
    return obj;
};
/**
 * Validates a given value against a prop type object
 *
 * @param {Object|*} type - Type to use for validation. Either a type object or a constructor
 * @param {*} value - Value to check
 * @param {boolean} silent - Silence warnings
 * @returns {boolean}
 */
export var validateType = function (type, value, silent) {
    if (silent === void 0) { silent = false; }
    var typeToCheck;
    var valid = true;
    var expectedType = '';
    if (!isPlainObject(type)) {
        typeToCheck = { type: type };
    }
    else {
        typeToCheck = type;
    }
    var namePrefix = isVueType(typeToCheck) ? typeToCheck._vueTypes_name + ' - ' : '';
    if (hasOwn.call(typeToCheck, 'type') && typeToCheck.type !== null) {
        if (isArray(typeToCheck.type)) {
            var typesArray = typeToCheck.type;
            valid = typesArray.some(function (type) { return validateType(type, value, true); });
            expectedType = typesArray.map(function (type) { return getType(type); }).filter(Boolean).join(' or ');
        }
        else {
            expectedType = getType(typeToCheck.type);
            if (expectedType === 'Array') {
                valid = isArray(value);
            }
            else if (expectedType === 'Object') {
                valid = isPlainObject(value);
            }
            else if (expectedType === 'String' || expectedType === 'Number' || expectedType === 'Boolean' || expectedType === 'Function') {
                valid = getNativeType(value) === expectedType;
            }
            else {
                valid = value instanceof typeToCheck.type;
            }
        }
    }
    if (!valid) {
        silent === false && warn(namePrefix + "value \"" + value + "\" should be of type \"" + expectedType + "\"");
        return false;
    }
    if (hasOwn.call(typeToCheck, 'validator') && isFunction(typeToCheck.validator)) {
        // swallow warn
        var oldWarn = void 0;
        if (silent) {
            oldWarn = warn;
            warn = noop;
        }
        valid = typeToCheck.validator(value);
        oldWarn && (warn = oldWarn);
        if (!valid && silent === false)
            warn(namePrefix + "custom validation failed");
        return valid;
    }
    return valid;
};
var warn = noop;
if (process.env.NODE_ENV !== 'production') {
    var hasConsole = typeof console !== 'undefined';
    warn = hasConsole ? function (msg) {
        Vue.config.silent === false && console.warn("[VueTypes warn]: " + msg);
    } : noop;
}
export { warn };
//# sourceMappingURL=utils.js.map