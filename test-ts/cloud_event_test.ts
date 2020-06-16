import { expect } from "chai";
import { CloudEvent, v1, v03, Version } from "../src";
import { CloudEventV03 } from "../src/event/v03";
import { CloudEventV1 } from "../src/event/v1";
import Extensions from "../src/event/extensions";

const type = "org.cncf.cloudevents.example";
const source = "http://unit.test";
const id = "b46cf653-d48a-4b90-8dfa-355c01061361";

const fixture: CloudEventV1 = {
  id,
  specversion: Version.V1,
  source,
  type
};

describe("A CloudEvent", () => {
  it("Can be constructed with a typed Message", () => {
    const ce = CloudEvent.create(fixture);
    expect(ce.type).to.equal(type);
    expect(ce.source).to.equal(source);
  });
});

describe("A 1.0 CloudEvent", () => {
  it("has retreivable source and type attributes", () => {
    const ce = new CloudEvent(fixture);
    expect(ce.source).to.equal("http://unit.test");
    expect(ce.type).to.equal("org.cncf.cloudevents.example");
  });

  it("defaults to specversion 1.0", () => {
    const ce = CloudEvent.create({ source, type });
    expect(ce.specversion).to.equal("1.0");
  });

  it("generates an ID if one is not provided in the constructor", () => {
    const ce = CloudEvent.create({ source, type });
    expect(ce.id).to.not.be.empty;
  })

  it("can be constructed with an ID", () => {
    const ce = new CloudEvent({ id: "1234", specversion: Version.V1, source, type });
    expect(ce.id).to.equal("1234");
  });

  it("generates a timestamp by default", () => {
    const ce = new CloudEvent(fixture);
    expect(ce.time).to.not.be.empty;
  });

  it("can be constructed with a timestamp", () => {
    const time = new Date().toISOString();
    const ce = new CloudEvent({ time, ...fixture });
    expect(ce.time).to.equal(time);
  });

  it("can be constructed with a dataContentType", () => {
    const ce = new CloudEvent({ dataContentType: "application/json", ...fixture });
    expect(ce.dataContentType).to.equal("application/json");
  });

  it("can be constructed with a dataSchema", () => {
    const ce = new CloudEvent({ dataSchema: "http://my.schema", ...fixture });
    expect(ce.dataSchema).to.equal("http://my.schema");
  });

  it("can be constructed with a subject", () => {
    const ce = new CloudEvent({ subject: "science", ...fixture });
    expect(ce.subject).to.equal("science");
  });

  // Handle deprecated attribute - should this really throw?
  it("throws a TypeError when constructed with a schemaurl", () => {
    expect(() => { new CloudEvent({ schemaURL: "http://throw.com", ...fixture }); })
      .to.throw(TypeError, "cannot set schemaURL on version 1.0 event");
  });

  it("can be constructed with data", () => {
    const data = { lunch: "tacos" };
    const ce = new CloudEvent({
      data, ...fixture
    });
    expect(ce.data).to.equal(data);
  });

  it("has extensions as an empty object by default", () => {
    const ce = new CloudEvent(fixture);
    expect(ce.extensions).to.be.an('object')
    expect(Object.keys(ce.extensions as object).length).to.equal(0);
  });

  it("can be constructed with extensions", () => {
    const extensions: Extensions = {
      "extension-key": "extension-value"
    };
    const ce = new CloudEvent({
      extensions, ...fixture
    });
    expect(Object.keys(ce.extensions as object).length).to.equal(1);
    expect(ce.extensions!["extension-key"]).to.equal(extensions["extension-key"]);
  });

  it("throws ValidationError if the CloudEvent does not conform to the schema");
  it("returns a JSON string even if format is invalid");
  it("correctly formats a CloudEvent as JSON");
});


describe("A 0.3 CloudEvent", () => {
  const v03fixture: CloudEventV03 = { ...fixture };
  v03fixture.specversion = Version.V03;

  it("has retreivable source and type attributes", () => {
    const ce = new CloudEvent(v03fixture);
    expect(ce.source).to.equal("http://unit.test");
    expect(ce.type).to.equal("org.cncf.cloudevents.example");
  });

  it("generates an ID if one is not provided in the constructor", () => {
    const ce = CloudEvent.create({ source, type }, Version.V03);
    expect(ce.id).to.not.be.empty;
    expect(ce.specversion).to.equal(Version.V03);
  })

  it("generates a timestamp by default", () => {
    const ce = new CloudEvent(v03fixture);
    expect(ce.time).to.not.be.empty;
  });

  it("can be constructed with a timestamp", () => {
    const time = new Date();
    const ce = new CloudEvent({ time, ...v03fixture });
    expect(ce.time).to.equal(time.toISOString());
  });

  it("can be constructed with a dataContentType", () => {
    const ce = new CloudEvent({ dataContentType: "application/json", ...v03fixture });
    expect(ce.dataContentType).to.equal("application/json");
  });

  it("can be constructed with a dataContentEncoding", () => {
    const ce = new CloudEvent({ dataContentEncoding: "Base64", ...v03fixture });
    expect(ce.dataContentEncoding).to.equal("Base64");
  });

  it("can be constructed with a schemaURL", () => {
    const ce = new CloudEvent({ schemaURL: "http://my.schema", ...v03fixture });
    expect(ce.schemaURL).to.equal("http://my.schema");
  });

  it("can be constructed with a subject", () => {
    const ce = new CloudEvent({ subject: "science", ...v03fixture });
    expect(ce.subject).to.equal("science");
  });

  // Handle 1.0 attribute - should this really throw?
  it("throws a TypeError when constructed with a dataSchema", () => {
    expect(() => { new CloudEvent({ dataSchema: "http://throw.com", ...v03fixture }); })
      .to.throw(TypeError, "cannot set dataSchema on version 0.3 event");
  });

  it("can be constructed with data", () => {
    const data = { lunch: "tacos" };
    const ce = new CloudEvent({
      data, ...v03fixture
    });
    expect(ce.data).to.equal(data);
  });

  it("throws ValidationError if the CloudEvent does not conform to the schema");
  it("returns a JSON string even if format is invalid");
  it("correctly formats a CloudEvent as JSON");
});
