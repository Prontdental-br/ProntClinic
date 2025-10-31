import { Account, Patient } from '../db/models'
import type { Paginate } from '../interfaces';

interface IPatientRepository {
  retrieveByAccountId(accountId: string, page: number): Promise<Paginate<Patient>>
  retrieveAllByAccountId(accountId: string): Promise<Patient[]>
}

class PatientRepository implements IPatientRepository {
  async retrieveByAccountId(accountId: string, page: number): Promise<Paginate<Patient>> {
    const limit = 10;
    const offset = page === 1 ? 0 : limit * (page - 1);
    const patients = await Patient.findAndCountAll({ where: { accountId: accountId }, offset, limit });

    return { data: patients.rows, totalItems: patients.count };
  }

  async retrieveAllByAccountId(accountId: string): Promise<Patient[]> {
    try {
      const patients = await Patient.findAll({
        where: { 
          accountId
        },
      });

      return patients;
    } catch (e) {
      console.error(e)
      
      return [];
    }
  }

  async bulkCreatePatients(patients: any[], accountId: string): Promise<void> {

    const account = await Account.findOne({
      where: {
        id: accountId
      }
    })

    const idSeq = account?.idSeq;

   const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${idSeq}`;

    try {
      await Patient.schema(schemaName).bulkCreate(patients);
    } catch (e) {
      console.error(e)
    }
  }
}

export default new PatientRepository()
