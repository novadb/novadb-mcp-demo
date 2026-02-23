---
globs: tests/fixtures/**/*.ts
---

# Constants and Type Reference

All constants are defined in `tests/fixtures/constants.ts`.

## Language IDs

| Constant | Value | Language |
|----------|-------|----------|
| `LANG_EN` | 201 | en-US |
| `LANG_DE` | 202 | de-DE |

## typeRef Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `TYPE_REF_OBJECT_TYPE` | 0 | Root object types |
| `TYPE_REF_ATTRIBUTE_DEF` | 10 | Attribute definitions |
| `TYPE_REF_BRANCH` | 40 | Branches |
| `TYPE_REF_FORM` | 50 | Forms |
| `TYPE_REF_APP_AREA` | 60 | Application areas |

## Universal Attributes

| Constant | ID | Description |
|----------|----|-------------|
| `ATTR_NAME` | 1000 | Display name (language-dependent) |
| `ATTR_DESCRIPTION` | 1012 | Description (language-dependent) |
| `ATTR_API_IDENTIFIER` | 1021 | API identifier string |

## Attribute Definition Properties (typeRef=10, 1001–1051)

| Constant | ID | Type | Notes |
|----------|----|------|-------|
| `ATTR_DATA_TYPE` | 1001 | String.DataType | |
| `ATTR_VARIANT_AXIS` | 1002 | ObjRef | |
| `ATTR_UNIT_OF_MEASURE` | 1003 | ObjRef | NOT attribute definitions |
| `ATTR_ALLOW_MULTIPLE` | 1004 | Boolean | |
| `ATTR_MAX_VALUES` | 1014 | Integer | 1=single, 0=multi |
| `ATTR_ALLOWED_TYPES` | 1015 | ObjRef list | For ObjRef data type |
| `ATTR_LANGUAGE_DEPENDENT` | 1017 | Boolean | |
| `ATTR_REQUIRED` | 1018 | Boolean | |
| `ATTR_VIRTUAL` | 1020 | Boolean | Computed attribute |
| `ATTR_REVERSE_RELATION_NAME` | 1051 | String | Language-dependent |

## Branch Properties (typeRef=40, 4000–4004)

| Constant | ID | Type |
|----------|----|------|
| `ATTR_BRANCH_PARENT` | 4000 | ObjRef |
| `ATTR_BRANCH_TYPE` | 4001 | ObjRef |
| `ATTR_BRANCH_WORKFLOW_STATE` | 4002 | ObjRef |
| `ATTR_BRANCH_DUE_DATE` | 4003 | DateTime.Date |
| `ATTR_BRANCH_ASSIGNED_TO` | 4004 | String.UserName |

## Object Type Properties (typeRef=0, 5001–5009)

| Constant | ID | Type | Notes |
|----------|----|------|-------|
| `ATTR_OBJ_TYPE_CREATE_FORM` | 5001 | ObjRef | Single form |
| `ATTR_OBJ_TYPE_DETAIL_FORMS` | 5002 | ObjRef | Multi-value |
| `ATTR_OBJ_TYPE_DISPLAY_NAME` | 5005 | ObjRef | |
| `ATTR_OBJ_TYPE_BINARY_PROXY` | 5009 | Boolean | |

## Form Properties (typeRef=50, 5053–5056)

| Constant | ID | Type | Notes |
|----------|----|------|-------|
| `ATTR_FORM_CONTENT` | 5053 | ObjRef | Multi-value, separate entries with sortReverse |
| `ATTR_FORM_CONDITION_ATTR` | 5054 | ObjRef | Single |
| `ATTR_FORM_CONDITION_REFS` | 5055 | ObjRef | Multi-value |
| `ATTR_FORM_IS_SINGLE_EDITOR` | 5056 | Boolean | |

## Application Area Properties (typeRef=60)

| Constant | ID | Type |
|----------|----|------|
| `ATTR_APP_AREA_OBJECT_TYPES` | 6001 | ObjRef (multi) |
| `ATTR_APP_AREA_SORT_KEY` | 6003 | Integer |

## DATA_TYPE_ENUM

Defined in `src/extensions/attributes/shared.ts`. Valid values:

```
String, TextRef, TextRef.JavaScript, TextRef.CSS,
XmlRef.SimpleHtml, XmlRef.VisualDocument,
Integer, Decimal, Float, Boolean,
DateTime, DateTime.Date,
ObjRef, BinRef, BinRef.Icon, BinRef.Thumbnail,
String.DataType, String.InheritanceBehavior, String.UserName, String.RGBColor
```
