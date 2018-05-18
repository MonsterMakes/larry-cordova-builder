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
    it.skip("should do the real world things", () => {
        let xml = require("../../../src/BaseXmlConfig");

        let domMutator = new DomMutator(xml,[
            {
                "type": "DomMutation",
                "description": "Fabric Plugin Mutation",
                "script": [
                    "document.querySelector('widget > plugin:last-child').insertAdjacentHTML('afterend', ",
                        "'<plugin name=\"cordova-fabric-plugin\" spec=\"^1.1.14-dev\">",
                            "<value FABRIC_API_KEY=\"0045ce2c8b29ca074051ed460718eecaf656c000\"></value>",
                            "<value FABRIC_API_SECRET=\"3c6e32a5670ab4715d8c86f8e75448a283e8630c0338d18b5d28f3a77cfd1d73\"></value>",
                        "</plugin>'",
                    ");"          
                ]
            },
            {
                "type": "DomMutation",
                "description": "RTMP Plugin Mutation",
                "script": [
                    "document.querySelector('widget > plugin:last-child').insertAdjacentHTML('afterend', ",
                        "'<plugin name=\"velocicast-cordova-plugin-rtmp\" spec=\"@auctionfrontier/velocicast-cordova-plugin-rtmp@^1.1.16\"></plugin>",
                    "');"          
                ]
            },
            {
                "type": "DomMutation",
                "description": "Push Notification Plugin Mutation",
                "script": [
                    "document.querySelector('widget > plugin:last-child').insertAdjacentHTML('afterend', ",
                        "'<plugin name=\"phonegap-plugin-push\" spec=\"^2.2.2\">",
                            "<value ANDROID_SUPPORT_V13_VERSION=\"27.+\"></value>",
                            "<value FCM_VERSION=\"11.6.2\"></value>",
                        "</plugin>",
                    "');",
                    "document.querySelector('widget > platform[name=android] *:first-child').insertAdjacentHTML('beforebegin', ",
                        "'<resource-file src=\"google-services.json\" target=\"app/google-services.json\"></resource-file>'",
                    ");"          
                ]
            },
            {
                "type": "DomMutation",
                "description": "Custom Url Scheme Plugin Mutation",
                "script": [
                    "document.querySelector('widget > plugin:last-child').insertAdjacentHTML('afterend', ",
                        "'<plugin name=\"cordova-fabric-customurlscheme\" spec=\"^4.3.0\">",
                            "<value name=\"URL_SCHEME\" value=\"pickles\"></value>",
                            "<value name=\"ANDROID_SCHEME\" value=\" \"></value>",
                            "<value name=\"ANDROID_HOST\" value=\" \"></value>",
                            "<value name=\"ANDROID_PATHPREFIX\" value=\"/\"></value>",
                        "</plugin>'",
                    ");"          
                ]
            },
        ]);

        return domMutator.build()
            .then((results)=>{ 
                console.log(results);
            });
    });
    
});