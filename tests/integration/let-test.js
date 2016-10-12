/* jshint expr:true */
import { expect } from 'chai';
import { 
  describe,
  beforeEach
  } from 'mocha';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import emberVersionIs from 'ember-version-is';
import Ember from 'ember';

import assign from '../helpers/assign';

const {
  run
} = Ember;

describeComponent('let', 'Integration: let helper', { 
  integration: true 
},
  function() {

    describe('inline', function() {
      if (emberVersionIs('lessThan', "2.0.0")) {
        return ;
      }
      
      describe('context', function() {
        beforeEach(function() {
          this.set('name', 'Alice');
          this.render(hbs`{{let name="Bob"}}`);
        });

        it('does not mutate the context', function(){
          expect(this.get('name')).to.eq('Alice');
        });
      });

      describe('in loop', function() {
        beforeEach(function() {
          this.set('pets', [{ type: 'cat' }, { type: 'dog' }, { type: 'pig' }]);
          this.render(hbs`
            <span class="before">{{type}}</span>
            {{#each pets as |pet|}}
              {{let type=pet.type}}
              <span class="item">{{type}}</span>
            {{/each}}
            <span class="after">{{type}}</span>
          `);
        });

        it('works correctly in a loop', function(){
          expect(this.$('.before').text()).to.eq('');
          expect(this.$('.after').text()).to.eq('');
          expect(this.$('.item').text()).to.eq('catdogpig');
        });
      });

      describe('multiple', function() {
        beforeEach(function() {
          this.set('pets', [{ type: 'cat' }, { type: 'dog' }, { type: 'pig' }]);
          this.render(hbs`
            {{let a='a' b='b'}}
            <span class="before">{{a}} {{b}}</span>
            {{let a='A' b='B' c=(concat a b)}}
            <span class="after">{{a}} {{b}} {{c}}</span>
          `);
        });

        it('creates bindings in parallel', function(){
          expect(this.$('.before').text()).to.eq('a b');
          expect(this.$('.after').text()).to.eq('A B ab');
        });
      });
    });

    describe('yield', function() {
      describe('helpers that recompute', function() {
        let computeCount;

        beforeEach(function() {
          computeCount = 0;
          this.register('helper:car', Ember.Helper.extend({
            compute(params, original) {
              computeCount++;

              let car = Object.create({}, {
                put: {
                  value: (key, value) => {
                    this.changed = assign({}, original, this.changed , {
                      [key]: value
                    });
                    this.recompute();
                  },
                  configurable: true
                }
              });

              return assign(car, this.changed || original);
            }
          }));

          this.render(hbs`
            {{~#let (car color="Silver" make="Suburu") as |myCar|~}}
              <ul>
              {{#each-in myCar as |name value|}}
                <li class="prop-{{name}}">
                  <strong>{{name}}</strong>: <span>{{value}}</span>
                  <button {{action myCar.put name "Changed"}}>Change</button>
                </li>
              {{/each-in}}
              </ul>
            {{~/let~}}
          `);

        });

        it('computes', function() {
          expect(computeCount).to.equal(1);
          expect(this.$('span').text()).to.equal('SilverSuburu');
        });

        describe('recompute', function() {
          beforeEach(function() {
            run(() => this.$('.prop-color button').click());
          });

          it('computes', function() {
            expect(computeCount).to.equal(2);
            expect(this.$('span').text()).to.equal('ChangedSuburu');
          });
        });
      });
    });

    describe('with yield', function() {
      describe('helpers that recompute', function() {
        let computeCount;

        beforeEach(function() {
          computeCount = 0;
          this.register('helper:car', Ember.Helper.extend({
            compute(params, original) {
              computeCount++;

              let car = Object.create({}, {
                put: {
                  value: (key, value) => {
                    this.changed = assign({}, original, this.changed , {
                      [key]: value
                    });
                    this.recompute();
                  },
                  configurable: true
                }
              });

              return assign(car, this.changed || original);
            }
          }));

          this.render(hbs`
            {{~#with (car color="Silver" make="Suburu") as |myCar|~}}
              <ul>
              {{#each-in myCar as |name value|}}
                <li class="prop-{{name}}">
                  <strong>{{name}}</strong>: <span>{{value}}</span>
                  <button {{action myCar.put name "Changed"}}>Change</button>
                </li>
              {{/each-in}}
              </ul>
            {{~/with~}}
          `);

        });

        it('computes', function() {
          expect(computeCount).to.equal(1);
          expect(this.$('span').text()).to.equal('SilverSuburu');
        });

        describe('recompute', function() {
          beforeEach(function() {
            run(() => this.$('.prop-color button').click());
          });

          it('computes', function() {
            expect(computeCount).to.equal(2);
            expect(this.$('span').text()).to.equal('ChangedSuburu');
          });
        });
      });
    });
  }
);
