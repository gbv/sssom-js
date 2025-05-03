import { expect, assert } from "chai"
import { isURI } from "../lib/valid-uri.js"

// Test examples from RFC 3986 adopted from Perl module Data::Validate::URI

describe("valid-uri", () => {

  it("should export a function", () => {
    expect( isURI ).to.be.a( "function" )
  })

  it("should positively validate", () => {
    const values = [
      "http://google.com",
      "http://localhost/",
      "http://example.w3.org/path%20with%20spaces.html",
      "http://example.w3.org/%20",
      "ftp://ftp.is.co.za/rfc/rfc1808.txt",
      "ftp://ftp.is.co.za/../../../rfc/rfc1808.txt",
      "http://www.ietf.org/rfc/rfc2396.txt",
      "ldap://[2001:db8::7]/c=GB?objectClass?one",
      "mailto:John.Doe@example.com",
      "news:comp.infosystems.www.servers.unix",
      "tel:+1-816-555-1212",
      "telnet://192.0.2.16:80/",
      "urn:oasis:names:specification:docbook:dtd:xml:4.1.2",
    ]

    for (let i=0; i<values.length; i++) {
      assert.ok(isURI(values[i]), values[i])
    }
  })

  it("should negatively validate", () => {
    const values = [
      5,
      null,
      undefined,
      true,
      NaN,
      {},
      [],
      function(){},
      "",
      "foo",
      "foo@bar", // no scheme
      "://foo/", // empty scheme
      "1http://foo", // invalid scheme
      "http://<foo>", // illegals
      "http:////foo.html", // invalid path,
      "http://example.w3.org/%illegal.html",
      "http://example.w3.org/%a", // incomplete hex escape
      "http://example.w3.org/%a/foo", // incomplete hex escape,
      "http://example.w3.org/%at", // incomplete hex escape
    ]

    for (let i=0; i<values.length; i++) {
      assert.notOk(isURI(values[i]), values[i])
    }
  })
})
