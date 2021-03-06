/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

import emberVersionIs from 'ember-version-is';

describe('Acceptance: let helper', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    visit('/');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('binds basic values', () => {
    andThen(() => {
      expect(find('ul.basic li:first').text()).to.equal('abc');
      expect(find('ul.basic li:last').text()).to.equal('123');
    });
  });

  it('binds nested values', () => {
    andThen(() => {
      let expected = ['first', 'second', 'third'];

      find('ul.with-hash li').each((i, v) => {
        expect($(v).text()).to.equal(expected[i]);
      });
    });
  });

  it('binds class instances', () => {
    andThen(() => {
      expect(find('.with-helper-object #bool-value').text()).to.equal('false');
    });

    click('button#toggle-bool');

    andThen(() => {
      expect(find('.with-helper-object #bool-value').text()).to.equal('true');
    });
  });

  it('will yield its block even when the value is falsey', () => {
    let expected = ['this is undefined', 'this is null', 'this is an empty array'];

    andThen(() => {
      find('.missing-values li').each((i, v) => {
        expect($(v).text()).to.equal(expected[i]);
      });
    });
  });

  if (emberVersionIs('greaterThan', "2.0.0")) {
    describe('inline', () => {

      it('works', () => {
        andThen(() => {
          expect(find('.inline-use').text()).to.equal("hello ");
        });

        click('button:contains(Greet the world)');

        andThen(() => {
          expect(find('.inline-use').text()).to.equal("hello world");
        });
      });

      it('respects scoping rules', () => {
        andThen(() => {

          let result = find('.inline-scoping li').map(function() {
            return $(this).text().trim();
          }).toArray();

          expect(result).to.deep.equal([
            'num = 0',
            'num = 1',
            'num = 2',
            'num = 3',
            'num = 0'
          ]);
        });
      });

      it('scopes to outmost scope', () => {
        andThen(() => {

          let result = find('.inline-hoisting li').map(function() {
            return $(this).text().trim();
          }).toArray();
          
          expect(result).to.deep.equal([
            '0',
            '1',
            '2',
            '3',
            '0'
          ]);
        });
      });

      it('supports multipe binding', function(){
        andThen(() => {
          expect($('.inline-multiple-binding .result').text()).to.equal('ember-let ');
        });
      
        click('button:contains(Show Addon Description)');

        andThen(() => {
          expect($('.inline-multiple-binding .result').text()).to.equal('ember-let variable declaration inspired by LISP');
        });
      });
      
    });
  }

});
