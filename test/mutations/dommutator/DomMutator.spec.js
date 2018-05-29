"use strict";
const _ = require("lodash");
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const testUtils = new (require('../../TestUtils'))(__dirname);
const DomMutator = require("../../../src/mutations/DomMutator");

const TEST_NAME = "Test DomMutator's build method()";
describe(TEST_NAME, () => {
    it("should add base xml", () => {
        let domMutator = new DomMutator('<root></root>',[]);
        
        return domMutator.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root></root>`);
            });
    });
    it("should add nested single xml element", () => {
        let domMutator = new DomMutator('<root></root>',[{
            "description": "details about this mutation",
            "script": `
                document.querySelector('root').innerHTML = '<h1 data-attr="true">text-contents</h1>';
            `
        }]);
        
        return domMutator.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<h1 data-attr="true">text-contents</h1>\n</root>`);          
            });
    });
    
    it("should augment a specific element using an attribute selector", () => {
        let xml = `
            <root>
                <plugin name="cordova-plugin-device" spec="^2.0.2" />
                <plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" />
                <plugin name="cordova.plugins.diagnostic" spec="^4.0.5" />
            </root>
        `;
        let script = `
            document.querySelector('root > plugin[name=cordova-plugin-device]').setAttribute('spec', 'HI MOM');
        `;
        
        let domMutator = new DomMutator(xml,[
            {
                "description": "details about this mutation",
                "script": script
            }
        ]);

        return domMutator.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<plugin name="cordova-plugin-device" spec="HI MOM"></plugin>\n\t<plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0"></plugin>\n\t<plugin name="cordova.plugins.diagnostic" spec="^4.0.5"></plugin>\n</root>`);
            });
    });
    it("should add element to an array of existing elements", () => {
        let xml = `
            <root>
                <plugin name="cordova-plugin-device" spec="^2.0.2" />
                <plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" />
                <plugin name="cordova.plugins.diagnostic" spec="^4.0.5" />
            </root>
        `;
        let script = `
            //document.querySelector('root > plugin:last-child').insertAdjacentHTML('afterend', '<plugin name="cordova-fabric-plugin" spec="^1.1.14-dev"></plugin>');
            
            // let elem = document.createElement("plugin");
            // elem.setAttribute('name','cordova-fabric-plugin');
            // elem.setAttribute('spec','^1.1.14-dev');
            // document.querySelector('root').appendChild(elem);

            document.querySelector('root').innerHTML += '<plugin name="cordova-fabric-plugin" spec="^1.1.14-dev"></plugin>';

            // let elem = (new DOMParser()).parseFromString('<plugin name="cordova-fabric-plugin" spec="^1.1.14-dev"></plugin>','text/xml').firstChild;
            // document.querySelector('root').appendChild(elem);
        `;
        
        let domMutator = new DomMutator(xml,[
            {
                "description": "details about this mutation", 
                "script": script
            }
        ]);

        return domMutator.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<plugin name="cordova-plugin-device" spec="^2.0.2"></plugin>\n\t<plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0"></plugin>\n\t<plugin name="cordova.plugins.diagnostic" spec="^4.0.5"></plugin>\n\t<plugin name="cordova-fabric-plugin" spec="^1.1.14-dev"></plugin>\n</root>`);
            });
    });
    it.skip("should work in jsdom 11.11.0 but it doesnt", () => {
        let xml = require("../../../src/BaseXmlConfig");

        let script = [
            "document.querySelector('widget > plugin:last-child').insertAdjacentHTML('afterend', ",
                "'<plugin name=\"cordova-fabric-plugin\" spec=\"^1.1.14-dev\">",
                    "<value FABRIC_API_KEY=\"somekey\"></value>",
                    "<value FABRIC_API_SECRET=\"somesecret\"></value>",
                "</plugin>'",
            ");"          
        ];
        let domMutator = new DomMutator();
        return domMutator._runScriptAgainstXmlDocument(xml,script);
    });
});