# GaadiDue: data-access feasibility gate

Status: research completed and a demo-data mobile prototype built; live API access and renewal-refresh behavior remain unverified. 23 September 2026.

Project context: this is currently a personal project without a registered organization, website, or official-domain email.

## Product promise to validate

A user adds vehicles and the app obtains current RC, insurance, PUCC, and road-tax dates automatically. A licence holder separately authorizes retrieval of their DL expiry. The app checks for changed dates after renewal and updates reminders without manual date entry.

## Evidence from official sources

- [MoRTH's mParivahan description](https://parivahan.gov.in/parivahan/en/content/step-virtualization) says the government service shows updated RC, DL, insurance, tax, fitness, and PUCC status. This establishes that the records exist, not that a third-party app has open access.
- [DigiLocker's XML format](https://docs.apisetu.gov.in/document-central/dl-xml-format/Appendix.html) defines RC insurance `validTill`, PUCC `validTill`, and `taxUpto`, plus a DL certificate expiry. Some attributes and records can be absent; actual responses need testing.
- [DigiLocker's requester API](https://cf-media.api-setu.in/resources/Requester-APISpecification-V1_12.pdf) describes user authorization, consent validity, access-token refresh, issued-document listing, XML retrieval, and document pull. It does not establish that rereading an issued document will always return the latest renewal.
- [DigiLocker's onboarding SOP](https://cf-media.api-setu.in/resources/Partners-SOP.pdf) requires a registered Indian organization, functional website, official-domain email, reviewed use case, and further onboarding steps. It states that temporary access for testing is not entertained.
- [MoRTH's National Transport Repository policy](https://morth.nic.in/sites/default/files/circulars_document/Data-Sharing-policy-20082025-merged.pdf) provides for approved private-sector data access with consent and safeguards. The exact parameters, refresh rights, limits, costs, and approval path for this app need written confirmation.
- [Parivahan's tax FAQ](https://parivahan.gov.in/index.php/en/node/132) says non-transport vehicle tax is generally paid for a 15-year period. A lifetime-tax status must not be treated as an ordinary approaching-expiry date.

## Candidate routes

| Route | What it could provide | Current blocker |
| --- | --- | --- |
| Direct MoRTH/NTR approval | VAHAN and SARATHI data under an approved use case | Organization eligibility, approval, permitted fields and refresh schedule, security obligations |
| DigiLocker requester | User-authorized RC and DL documents in machine-readable form where available | Partner approval; prove current values after document renewal; coverage and consent duration |
| Commercial verification API | Faster initial integration if its contract permits consumer reminders and recurring queries | Proven data provenance and usage rights, field coverage, freshness, price, and DL support |

Published examples to evaluate, not selected vendors: [Cashfree RC verification](https://www.cashfree.com/rc-verification/) lists RC expiry and insurance information; [HyperVerge RC Plus](https://docs.internal.hyperverge.co/modules-and-apis/india/apis/RC%20APIs/rc_plus_verification_api/) advertises insurance, tax, and pollution details. Marketing pages are not evidence of a guaranteed field or refresh rate.

## Required live test

1. Obtain written confirmation that the provider permits a consumer reminder app to store minimum expiry data and re-query it automatically.
2. Obtain test credentials through the provider's approved process. Keep credentials server-side.
3. With each owner's consent, test at least two bikes and two cars from more than one state, including a recently renewed insurance or PUCC record, a tax-lifetime vehicle, and a registration near renewal if available. Test each consenting DL holder separately.
4. Record, per lookup: requested identifier, available fields, missing fields, source timestamp, retrieval timestamp, errors, quota use, and cost. Keep personal details out of the shared report.
5. Query again after a known renewal reaches the official record. Verify that the expiry actually changes without the user re-entering it. Measure delay.
6. Pass only if the provider's contract permits repeated checks, the priority dates are returned for the chosen pilot population, renewal changes propagate within an acceptable period, and the economics work at expected usage.

## Questions for prospective providers

- What is your documented authority and source for VAHAN, SARATHI, and PUCC data? Can you supply evidence of onward-sharing rights for this use case?
- Which exact response fields cover RC expiry, insurance expiry, PUCC expiry, tax validity, and DL expiry? Are they present across states and vehicle classes?
- Are lookups and scheduled re-lookups permitted after the user's initial consent? How long does consent last, and how is it renewed or withdrawn?
- Are returned values live, cached, or document snapshots? What update delay follows an insurance/PUCC/RC/DL renewal?
- What are the per-call price, minimum commitment, rate limits, uptime terms, and charges for failed or empty responses?
- What identity/ownership proof is required for a family vehicle or another household member's DL?
- What retention, security, audit, breach, and India-hosting obligations apply?

## Decision now

The personal-project status does not satisfy the published DigiLocker requester onboarding conditions. A commercial provider might support an earlier experiment, but its eligibility and onward-use rights need written confirmation. For example, [Cashfree says merchant activation requires business documents and a website/app review](https://www.cashfree.com/contact-us/). A "free developer account" or sandbox alone would prove request formatting, not lawful real-data access or renewal behavior.

A prototype now exercises the add, display, simulated renewal, persistence, and reminder-planning flows. No production data integration or API-provider selection yet. The next data milestone is an approved API account and a real-data test. Public documentation establishes technical plausibility; it does not establish a dependable product promise.
