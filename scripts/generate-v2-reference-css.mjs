// Design exports are inputs only. Namespace their CSS; never ship the mock runtime/data.
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import postcss from 'postcss';

for (const [name, scope, output] of [
  ['BentoPinkFinal', '.v2-design', 'reference-home.css'],
  ['ChatFull', '.v2-chat', 'reference-chat.css'],
  ['MemoFull', '.v2-memo', 'reference-memo.css'],
  ['PlacesFull', '.v2-places', 'reference-places.css'],
  ['SettlementFull', '.v2-settlement', 'reference-settlement.css'],
]) {
  const html = execFileSync('unzip', ['-p', `designv2/${name}-html.zip`, `${name}.dc.html`], { encoding: 'utf8' });
  const css = postcss.parse(html.match(/<style>([\s\S]*?)<\/style>/)[1]);
  const animations = new Map();
  css.walkComments(comment => comment.remove());
  css.walkAtRules(/keyframes$/, rule => {
    animations.set(rule.params, `bp-${rule.params}`);
    rule.params = `bp-${rule.params}`;
  });
  css.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(selector => {
      let value = selector.replace(/\.([a-zA-Z_][\w-]*)/g, '.bp-$1');
      value = value.replace(/:root|(?<![\w.-])body(?![\w-])/g, scope);
      return value.startsWith(scope) ? value : `${scope} ${value}`;
    });
  });
  css.walkDecls(decl => {
    if (/animation/.test(decl.prop)) {
      decl.value = decl.value.replace(/[a-zA-Z][\w-]*/g, word => animations.get(word) || word);
    }
  });
  writeFileSync(`src/ui/v2/${output}`, `/* Generated from ${name}.dc.html. Run node scripts/generate-v2-reference-css.mjs. */\n${css.toString()}\n`);
}
