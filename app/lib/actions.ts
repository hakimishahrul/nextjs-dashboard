
// Adding the Server Actions directly inside Server Components by adding "use server" inside the action.
'use server';

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});


// Create invoices
export async function createInvoice(formData: FormData) {

    const {customerId, amount, status} = CreateInvoice.parse({

        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),

    });
    const amountInCents = amount * 10;
    const date = new Date().toISOString().split('T')[0];


    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    
    } catch(err) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        };
    }
    // Insert data into SQL

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// Update Invoices
export async function updateInvoice(id: string, formData: FormData) {
    const {customerId, amount, status} = UpdateInvoice.parse({
        customerId: formData.get('customerId'), 
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
        `;

    } catch (error) {
        return {
            message: 'Database Error: Failed to update Invoice.'
        };
    }


    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// Delete invoices
export async function deleteInvoice(id: string) {

    // Testing throwing error.
    throw new Error('Failed to Delete Invoice.');

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return {message: 'Deleted Invoice.'};
    } catch (error) {
        return {
            message: 'Database Error: Failed to delete Invoice.'
        }
    }
    
    
}