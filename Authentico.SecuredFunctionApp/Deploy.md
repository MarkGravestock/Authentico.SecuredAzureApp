az ad app create --display-name "FuncAPI" --credential-description "funcapi" --password "p@ssword1" --reply-urls "http://localhost:7071" --identifier-uris "https://funcapi.<tenantname>.onmicrosoft.com"

deploy function

add cors - that'll allow fruit data imperative to work