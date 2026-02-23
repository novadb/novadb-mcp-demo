// --- Language IDs ---
export const LANG_EN = 201;  // en-US
export const LANG_DE = 202;  // de-DE

// --- Universal Attribute IDs ---
export const ATTR_NAME = 1000;            // String, language-dependent
export const ATTR_DESCRIPTION = 1012;    // TextRef, language-dependent
export const ATTR_API_IDENTIFIER = 1021; // String, language-independent

// --- Attribute Definition Properties (typeAttribute, typeRef=10) ---
export const ATTR_DATA_TYPE = 1001;          // String enum
export const ATTR_VARIANT_AXIS = 1002;       // ObjRef — variant axis
export const ATTR_UNIT_OF_MEASURE = 1003;    // ObjRef (ref type 30) — unit of measure
export const ATTR_ALLOW_MULTIPLE = 1004;     // Boolean (multi-valued)
export const ATTR_SORTABLE_VALUES = 1005;    // Boolean — sortable multi-values
export const ATTR_PREDEFINED = 1006;         // Boolean — has predefined values (attributePredefined)
export const ATTR_FORMAT_STRING = 1007;      // String — display format (e.g. date format)
export const ATTR_VALIDATION_CODE = 1008;    // TextRef.JavaScript
export const ATTR_VIRTUALIZATION_CODE = 1009; // TextRef.JavaScript — computed attribute code
export const ATTR_HAS_LOCAL_VALUES = 1010;   // Boolean — also "Available as Search Filter" in attribute-definition forms
export const ATTR_LIST_VIEW_COLUMN = 1011;   // Boolean — available as list view column
export const ATTR_INHERITANCE_BEHAVIOR = 1013; // String.InheritanceBehavior — None/Inheriting/InheritingAll
export const ATTR_MAX_VALUES = 1014;         // Integer (1=single, 0=multi) — also "Inheritance Order" in attribute-definition forms
export const ATTR_ALLOWED_TYPES = 1015;      // ObjRef list (referencedObjectTypes)
export const ATTR_LANGUAGE_DEPENDENT = 1017; // Boolean
export const ATTR_REQUIRED = 1018;           // Boolean — whether values are required
export const ATTR_PARENT_GROUP = 1019;       // ObjRef — parent attribute group
export const ATTR_VIRTUAL = 1020;            // Boolean — computed by JavaScript
export const ATTR_SORTABLE_CHILD_OBJECTS = 1023; // Boolean — child objects sortable
export const ATTR_DISABLE_SPELL_CHECKING = 1028; // Boolean — disable spell checking
export const ATTR_REVERSE_RELATION_NAME = 1051;  // String (lang-dep) — name of reverse relation
export const ATTR_UNIQUE_VALUES = 1032;      // Boolean — unique constraint

// --- Branch Properties (typeBranch, typeRef=40) ---
export const ATTR_BRANCH_PARENT = 4000;          // ObjRef — parent work package
export const ATTR_BRANCH_TYPE = 4001;            // ObjRef — branch type
export const ATTR_BRANCH_WORKFLOW_STATE = 4002;  // ObjRef — current workflow state
export const ATTR_BRANCH_DUE_DATE = 4003;        // DateTime.Date — e.g. "2026-03-01"
export const ATTR_BRANCH_ASSIGNED_TO = 4004;     // String.UserName — assigned user

// --- Object Type Properties (root, typeRef=0) ---
export const ATTR_OBJ_TYPE_CREATE_FORM = 5001;   // ObjRef (single create form)
export const ATTR_OBJ_TYPE_DETAIL_FORMS = 5002;  // ObjRef (multi detail forms / tabs)
export const ATTR_OBJ_TYPE_DISPLAY_NAME = 5005;  // ObjRef (display name attribute)
export const ATTR_OBJ_TYPE_DISPLAY_ICON = 5006;  // ObjRef (display icon attribute)
export const ATTR_OBJ_TYPE_THUMBNAIL = 5008;     // ObjRef (thumbnail attribute)
export const ATTR_OBJ_TYPE_BINARY_PROXY = 5009;  // Boolean

// --- Form Properties (typeForm, typeRef=50) ---
export const ATTR_FORM_CONTENT = 5053;            // ObjRef — INDIVIDUAL entries per field, NOT array
export const ATTR_FORM_CONDITION_ATTR = 5054;     // ObjRef (single condition attribute)
export const ATTR_FORM_CONDITION_REFS = 5055;     // ObjRef (multi condition objects)
export const ATTR_FORM_IS_SINGLE_EDITOR = 5056;   // Boolean

// --- Application Area Properties (typeApplicationArea, typeRef=60) ---
export const ATTR_APP_AREA_OBJECT_TYPES = 6001;   // ObjRef (multi)
export const ATTR_APP_AREA_SORT_KEY = 6003;        // Integer

// --- typeRef Constants ---
export const TYPE_REF_OBJECT_TYPE = 0;       // root
export const TYPE_REF_ATTRIBUTE_DEF = 10;    // typeAttribute
export const TYPE_REF_BRANCH = 40;           // typeBranch
export const TYPE_REF_FORM = 50;             // typeForm
export const TYPE_REF_APP_AREA = 60;         // typeApplicationArea

// --- Condition Type IDs ---
export const TYPE_ID_SCRIPTED_CONDITION = 170;           // typeScriptedCondition
export const TYPE_ID_OBJ_REF_CONDITION = 171;            // typeObjectReferenceValueCondition
export const TYPE_ID_USERNAME_CONDITION = 172;           // typeUserNameValueCondition
export const TYPE_ID_STRING_CONDITION = 173;             // typeStringValueCondition
export const TYPE_ID_NUMERIC_CONDITION = 174;            // typeNumericValueCondition
export const TYPE_ID_TIMESTAMP_CONDITION = 175;          // typeTimestampValueCondition
export const TYPE_ID_BOOLEAN_CONDITION = 176;            // typeBooleanValueCondition
