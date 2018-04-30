"use strict";
const _ = require("lodash");
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const testUtils = new (require('../TestUtils'))(__dirname);
const XmlMutator = require("../../src/XmlMutator");

const TEST_NAME = "Test XmlMutator's _build method()";
describe(TEST_NAME, () => {
    it("should add a single xml element", (done) => {
        let xmlWriter = new XmlMutator('',[
            {
                op: 'add',
                path: '/h1',
                value: {
                    "_":"text-contents",
                    "$":{
                        "data-attr":"true"
                    }
                }
            }
        ]);
        
        xmlWriter.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<h1 data-attr="true">text-contents</h1>`);
                done();          
            })
            .catch(done);
    });
    it("should add base xml", (done) => {
        let xmlWriter = new XmlMutator('<root></root>',[]);
        
        xmlWriter.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root></root>`);
                done();          
            })
            .catch(done);
    });
    it("should add nested single xml element", (done) => {
        let xmlWriter = new XmlMutator('<root></root>',[
            {
                op: 'replace',
                path: '/root',
                value: {
                    h1:[{
                        "_":"text-contents",
                        "$":{
                            "data-attr":"true"
                        }
                    }]
                }
            }
        ]);
        
        xmlWriter.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<h1 data-attr="true">text-contents</h1>\n</root>`);
                done();          
            })
            .catch(done);
    });
    it("should add element to an array of existing elements", (done) => {
        let xmlWriter = new XmlMutator('<root><plugin name="cordova-plugin-device" spec="^2.0.2" /><plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0" /><plugin name="cordova.plugins.diagnostic" spec="^4.0.5" /></root>',[
            {
                "op": "add",
                "path": "/root/plugin/-",
                "value": {
                    "$": {
                        "name": "cordova-fabric-plugin",
                        "spec": "^1.1.14-dev"
                    }
                }
            }
        ]);
        
        xmlWriter.build()
            .then((results)=>{ 
                results.should.deep.equal(`<?xml version="1.0" encoding="UTF-8"?>\n<root>\n\t<plugin name="cordova-plugin-device" spec="^2.0.2"></plugin>\n\t<plugin name="cordova-plugin-jailbreak-detection" spec="^0.1.0"></plugin>\n\t<plugin name="cordova.plugins.diagnostic" spec="^4.0.5"></plugin>\n\t<plugin name="cordova-fabric-plugin" spec="^1.1.14-dev"></plugin>\n</root>`);
                done();          
            })
            .catch(done);
    });
    it.skip("Examples to reverse engineer the json structure", (done) => {
        let examples = [
            '<?xml version="1.0" encoding="UTF-8"?><root><div></div></root>',
            '<?xml version="1.0" encoding="UTF-8"?><root><div>FirstDiv</div><div>SecondDiv</div></root>',
            '<?xml version="1.0" encoding="UTF-8"?><root><div><h1></h1></div></root>',
            '<?xml version="1.0" encoding="UTF-8"?><root><div><h1 data-attr="true"></h1><h1></h1></div></root>',
            '<?xml version="1.0" encoding="UTF-8"?><root><div><h1 data-attr="1" data-attr2="true">First</h1><h1>Second</h1></div></root>',
            //'<?xml version="1.0" encoding="UTF-8"?><root></root>' //ROOT IS THE SPECIAL CASE
        ]
        let proms = [];
        examples.forEach((example)=>{
            let xmlWriter = new XmlMutator('',[]);
            let prom = xmlWriter._parseXml(example)
                .then(parsedJs=>{
                    let xmlOut = xmlWriter._buildXml(parsedJs,{renderOpts:{pretty:false}})
                    console.log("Example "+example,JSON.stringify(parsedJs));
                    xmlOut.should.equal(example);
                });
            proms.push(prom);
        });

        Promise.all(proms)
            .then(()=>{done();})
            .catch(done);
    });
});