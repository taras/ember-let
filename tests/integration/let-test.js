/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import emberVersionIs from 'ember-version-is';
import Ember from 'ember';

const {
  merge
} = Ember;

const {
  create
} = Object;

describeComponent('let', 'Integration: let helper', { 
  integration: true 
},
  function() {

    if (emberVersionIs('lessThan', "2.0.0")) {
      return ;
    }

    it('does not mutate the context', function(){
      this.set('name', 'Alice');
      this.render(hbs`{{let name="Bob"}}`);
      expect(this.get('name')).to.eq('Alice');
    });

    it('works correctly in a loop', function(){
      this.set('pets', [{ type: 'cat' }, { type: 'dog' }, { type: 'pig' }]);
      this.render(hbs`
        <span class="before">{{type}}</span>
        {{#each pets as |pet|}}
          {{let type=pet.type}}
          <span class="item">{{type}}</span>
        {{/each}}
        <span class="after">{{type}}</span>
      `);

      expect(this.$('.before').text()).to.eq('');
      expect(this.$('.after').text()).to.eq('');
      expect(this.$('.item').text()).to.eq('catdogpig');
    });

    it('creates bindings in parallel', function(){
      this.set('pets', [{ type: 'cat' }, { type: 'dog' }, { type: 'pig' }]);
      this.render(hbs`
        {{let a='a' b='b'}}
        <span class="before">{{a}} {{b}}</span>
        {{let a='A' b='B' c=(concat a b)}}
        <span class="after">{{a}} {{b}} {{c}}</span>
      `);

      expect(this.$('.before').text()).to.eq('a b');
      expect(this.$('.after').text()).to.eq('A B ab');
    });

    it('helpers that recompute', function() {
      let computeCount = 0;

      this.register('helper:object', Ember.Helper.extend({
        compute(params, options) {
          computeCount++;
          if (this.value) {
            let value = this.value;
            delete this.value;
            return this.current = decorate(this, value);
          } else {
            return this.current = decorate(this, options);
          }
          
          function decorate(helper, options) {
            return merge(create({}, {
              put: {
                value: (key, value) => {
                  let result = merge({}, helper.current);
                  helper.value = merge(result, {[key]: value});
                  helper.recompute();
                }
              }
            }), options);
          }
        }
      }));

      this.render(hbs`
        {{#let (object green="0B610B" red="FF0000") as |colors|}}
          <ul>
            {{#each-in colors as |name value|}}
              <li class="spec-object-prop spec-object-prop-{{name}}">
                <strong>{{name}}</strong>: <span class="spec-object-prop-value">{{value}}</span>
                <button {{action colors.put name "FFFFFF"}}>Make white</button>
              </li>
            {{/each-in}}
          </ul>
        {{/let}}
      `);

      expect(computeCount).to.equal(1);
      expect(this.$('.spec-object-prop').length).to.equal(2);
      expect(this.$('.spec-object-prop-green .spec-object-prop-value').text()).to.equal('0B610B');
      expect(this.$('.spec-object-prop-red .spec-object-prop-value').text()).to.equal('FF0000');

      Ember.run(() => {
        $('.spec-object-prop-green :contains(Make white)').click();
      });

      expect(computeCount).to.equal(2);
      expect(this.$('.spec-object-prop-green .spec-object-prop-value').text()).to.equal('FFFFFF');
    });
  }
);
