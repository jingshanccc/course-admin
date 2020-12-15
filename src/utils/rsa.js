import JSEncrypt from 'jsencrypt/bin/jsencrypt'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}

const privateKey = `-----BEGIN MICAH RSA PRIVATE KEY -----
MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAJnqeWNO/wvF2i3a
El+Gj9uv7mfRvNzg9Y7c6RKZyqLuZVZulSdVgl5CyiWDmORYGr9I6PoH4JL/c0IO
XAcKoASCNGwNOSrKTFgRtMQWTQNe7Gd0aS9OA0DITYsg26dqRyrclI02q+5WXLCg
YNlBSIW0azx9sMsv3Qd6SHRzwd8rAgMBAAECgYEAgjgdgUa5g6VeJQLmHonDNnPP
eWi6qAlv1/HRA1q4VUbq18hxSrkOtl89laWT+kUMRCAUdE2r09JqGk350D9OB5KE
AUAsSqFff+xJZOT/Qe6FJLnwGabU7SfUu+PqsJA94PuA5ZoBDHY1PJbPqZXYwlaa
GWAkT6YXWNjFepiZJMECQQDLJkEo6FXI/M4KDd4L/A76ioJUE1fsKRClbW0Gb55v
9zJ+N8i2Pt7V3a8brOqY01CW+An2LlAVwV/Wj6p/kzXLAkEAwfVE3vsHvQ6BztaJ
Q5lSepN54Iwe9dIP5+qmelCblRdkZVpk2e24j+6lfd5WeCvjaRo8mRMEh8fhF9yL
x9nQIQJBAIagQFhCt+7tEgH5tKgOj0Kbncjn1MFtaVmnzbORLtcWY4DfqQSVX4kt
UwktK37Bs0uI7tkVUf9I2iFPrfbDcMcCQQCOb5AkMDV+oSiyvNoQyofHfIYEYOJb
o+gKaEfZi1i2JHeV9swZPnpLOPZPePgHSDO4+4uE3nJ1RFQJMe101oABAkEAxhW5
lBH8/TYxevLwLJHJzIcoMkhJljgG1tbJJA44WIEwFbdnA92dOszo5HrGuYqF1c1E
XoXmxLfbqYqxGOrN0g==
-----END MICAH RSA PRIVATE KEY -----`

const publicKey = `-----BEGIN MICAH RSA PUBLIC KEY -----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZ6nljTv8Lxdot2hJfho/br+5n
0bzc4PWO3OkSmcqi7mVWbpUnVYJeQsolg5jkWBq/SOj6B+CS/3NCDlwHCqAEgjRs
DTkqykxYEbTEFk0DXuxndGkvTgNAyE2LINunakcq3JSNNqvuVlywoGDZQUiFtGs8
fbDLL90Hekh0c8HfKwIDAQAB
-----END MICAH RSA PUBLIC KEY -----`

