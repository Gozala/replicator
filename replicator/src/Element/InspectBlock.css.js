export default `
:host {
  overflow-x: auto;
}

.observablehq--expanded,
.observablehq--collapsed,
.observablehq--function,
.observablehq--import,
.observablehq--string:before,
.observablehq--string:after,
.observablehq--gray {
color: var(--syntax_normal);
}
.observablehq--collapsed,
.observablehq--inspect a {
cursor: pointer;
}
.observablehq--caret {
margin-right: 4px;
vertical-align: middle;
}
.observablehq--string-expand {
margin-left: 6px;
padding: 2px 6px;
border-radius: 2px;
font-size: 80%;
background: #eee;
color: #888;
cursor: pointer;
vertical-align: middle;
}
.observablehq--string-expand:hover {
color: #222;
}
.observablehq--field {
text-indent: -1em;
margin-left: 1em;
}
.hljs-comment,
.observablehq--empty {
color: var(--syntax_comment);
}
.hljs-keyword,
.hljs-attribute,
.hljs-selector-tag,
.hljs-meta-keyword,
.hljs-doctag,
.hljs-name,
a[href],
.observablehq--keyword,
.observablehq--blue {
color: #3182bd;
}
.observablehq--forbidden,
.observablehq--pink {
color: #e377c2;
}
.observablehq--orange {
color: #e6550d;
}
.hljs-literal,
.observablehq--null,
.observablehq--undefined,
.observablehq--boolean {
color: var(--syntax_atom);
}
.hljs-number,
.hljs-regexp,
.hljs-symbol,
.hljs-template-variable,
.observablehq--bigint,
.observablehq--number,
.observablehq--date,
.observablehq--regexp,
.observablehq--symbol,
.observablehq--green {
color: var(--syntax_number);
}
.observablehq--index,
.observablehq--key {
color: var(--syntax_key);
}
.observablehq--empty {
font-style: oblique;
}
.hljs-string,
.observablehq--string,
.observablehq--purple {
color: var(--syntax_string);
}
/* Note: Tachyons' dark-red */
.observablehq--error,
.observablehq--red {
color: #e7040f;
}

.observablehq {
position: relative;
min-height: 33px; /* Note: adjusted dynamically! */
border-left: solid 4px transparent;
margin-left: -4px;
transition: border-left-color 250ms linear;
}
.observablehq--inspect {
font: var(--mono_fonts);
overflow-x: auto;
display: block;
padding: 6px 0;
white-space: pre;
}
.observablehq--error {
border-left-color: #e7040f;
}
.observablehq--error .observablehq--inspect {
word-break: break-all;
white-space: pre-wrap;
}
.observablehq--running,
.observablehq--changed {
border-left-color: hsl(217, 13%, 70%);
}


:host {
outline: none;
contain: content;
position: relative;
}

.selector {
position: fixed;
top: 5px;
right: 5px;
z-index: 99999;
}

output {
  display:inline-block;
}
section {
  padding: 0 14px;
}
select {
  outline:none;
  opacity:0.2;
  cursor: pointer;
}

select:hover {
  opacity: 0.6;
}

select:focus {

}

section {
  overflow: auto;
}
section:not(.selected) {
  display:none;
}
`
