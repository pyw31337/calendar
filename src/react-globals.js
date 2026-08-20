import React from 'react';
import * as ReactDOMAll from 'react-dom';
import { createRoot } from 'react-dom/client';

window.React = React;
window.ReactDOM = { ...ReactDOMAll, createRoot };

export default React;
