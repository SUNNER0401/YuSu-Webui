import api from '@/store/api';
import i18n from '@/i18n';

export const CERTIFICATE_TYPES = [
  {
    type: 'HTTPS Certificate',
    location: '/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates/',
    label: i18n.t('pageCertificates.httpsCertificate'),
  },
  {
    type: 'LDAP Certificate',
    location: '/redfish/v1/AccountService/LDAP/Certificates/',
    label: i18n.t('pageCertificates.ldapCertificate'),
  },
  {
    type: 'TrustStore Certificate',
    location: '/redfish/v1/Managers/bmc/Truststore/Certificates/',
    // Web UI will show 'CA Certificate' instead of
    // 'TrustStore Certificate' after user testing revealed
    // the term 'TrustStore Certificate' wasn't recognized/was unfamilar
    label: i18n.t('pageCertificates.caCertificate'),
  },
];

const getCertificateProp = (type: string, prop: string) => {
  const certificate: any = CERTIFICATE_TYPES.find(
    (certificate) => certificate.type === type
  );
  return certificate ? certificate[prop] : null;
};

const CertificatesStore = {
  namespaced: true,
  state: {
    allCertificates: [],
    availableUploadTypes: [],
  },
  getters: {
    allCertificates: (state: { allCertificates: any }) => state.allCertificates,
    availableUploadTypes: (state: { availableUploadTypes: any }) =>
      state.availableUploadTypes,
  },
  mutations: {
    setCertificates(state: { allCertificates: any }, certificates: any) {
      state.allCertificates = certificates;
    },
    setAvailableUploadTypes(
      state: { availableUploadTypes: any },
      availableUploadTypes: any
    ) {
      state.availableUploadTypes = availableUploadTypes;
    },
  },
  actions: {
    async getCertificates({ commit }: any) {
      return await api
        .get('/redfish/v1/CertificateService/CertificateLocations')
        .then(({ data: { Links: { Certificates } } }) =>
          Certificates.map(
            (certificate: { [x: string]: any }) => certificate['@odata.id']
          )
        )
        .then((certificateLocations) => {
          const promises = certificateLocations.map((location: string) =>
            api.get(location)
          );
          api.all(promises).then(
            api.spread((...responses: any) => {
              const certificates = responses.map(({ data }: any) => {
                const {
                  Name,
                  ValidNotAfter,
                  ValidNotBefore,
                  Issuer = {},
                  Subject = {},
                } = data;
                return {
                  type: Name,
                  location: data['@odata.id'],
                  certificate: getCertificateProp(Name, 'label'),
                  issuedBy: Issuer.CommonName,
                  issuedTo: Subject.CommonName,
                  validFrom: new Date(ValidNotBefore),
                  validUntil: new Date(ValidNotAfter),
                };
              });
              const availableUploadTypes = CERTIFICATE_TYPES.filter(
                ({ type }) =>
                  !certificates
                    .map((certificate: { type: string }) => certificate.type)
                    .includes(type)
              );

              commit('setCertificates', certificates);
              commit('setAvailableUploadTypes', availableUploadTypes);
            })
          );
        });
    },
    async addNewCertificate(
      { dispatch }: any,
      { file, type }: { file: Blob; type: string }
    ) {
      return await api
        .post(getCertificateProp(type, 'location'), file, {
          headers: { 'Content-Type': 'application/x-pem-file' },
        })
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successAddCertificate', {
            certificate: getCertificateProp(type, 'label'),
          })
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageCertificates.toast.errorAddCertificate') as string
          );
        });
    },
    async replaceCertificate(
      { dispatch }: any,
      {
        certificateString,
        location,
        type,
      }: { certificateString: string; location: string; type: string }
    ) {
      const data: { [index: string]: any } = {};
      data.CertificateString = certificateString;
      data.CertificateType = 'PEM';
      data.CertificateUri = { '@odata.id': location };

      return await api
        .post(
          '/redfish/v1/CertificateService/Actions/CertificateService.ReplaceCertificate',
          data,
          undefined
        )
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successReplaceCertificate', {
            certificate: getCertificateProp(type, 'label'),
          })
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageCertificates.toast.errorReplaceCertificate') as string
          );
        });
    },
    async deleteCertificate(
      { dispatch }: any,
      { type, location }: { type: string; location: string }
    ) {
      return await api
        .delete(location, undefined)
        .then(() => dispatch('getCertificates'))
        .then(() =>
          i18n.t('pageCertificates.toast.successDeleteCertificate', {
            certificate: getCertificateProp(type, 'label'),
          })
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageCertificates.toast.errorDeleteCertificate') as string
          );
        });
    },
    async generateCsr(
      _: any,
      userData: {
        certificateType: any;
        country: any;
        state: any;
        city: any;
        companyName: any;
        companyUnit: any;
        commonName: any;
        keyPairAlgorithm: any;
        keyBitLength: any;
        keyCurveId: any;
        challengePassword: any;
        contactPerson: any;
        emailAddress: any;
        alternateName: any;
      }
    ) {
      const {
        certificateType,
        country,
        state,
        city,
        companyName,
        companyUnit,
        commonName,
        keyPairAlgorithm,
        keyBitLength,
        keyCurveId,
        challengePassword,
        contactPerson,
        emailAddress,
        alternateName,
      } = userData;
      const data: { [index: string]: any } = {};

      data.CertificateCollection = {
        '@odata.id': getCertificateProp(certificateType, 'location'),
      };
      data.Country = country;
      data.State = state;
      data.City = city;
      data.Organization = companyName;
      data.OrganizationalUnit = companyUnit;
      data.CommonName = commonName;
      data.KeyPairAlgorithm = keyPairAlgorithm;
      data.AlternativeNames = alternateName;

      if (keyCurveId) data.KeyCurveId = keyCurveId;
      if (keyBitLength) data.KeyBitLength = keyBitLength;
      if (challengePassword) data.ChallengePassword = challengePassword;
      if (contactPerson) data.ContactPerson = contactPerson;
      if (emailAddress) data.Email = emailAddress;

      return await api
        .post(
          '/redfish/v1/CertificateService/Actions/CertificateService.GenerateCSR',
          data,
          undefined
        )
        //TODO: Success response also throws error so
        // can't accurately show legitimate error in UI
        .catch((error) => console.log(error));
    },
  },
};

export default CertificatesStore;
