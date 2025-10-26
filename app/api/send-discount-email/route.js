import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userEmail, userName, notificationEmail } = await request.json();

    // For now, we'll just log the email request
    // In production, you would integrate with an email service like SendGrid, Nodemailer, etc.
    console.log('Discount email request:', {
      userEmail,
      userName,
      notificationEmail,
      timestamp: new Date().toISOString()
    });

    // Simulate email sending success
    // In production, replace this with actual email sending logic
    const emailData = {
      to: notificationEmail,
      subject: `🎉 New Discount Request from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Discount Request - Prompt IQ</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">User Details:</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Discount Code:</strong> LAUNCH10 (10% OFF)</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #6b7280;">This user has requested the 10% launch discount. Please follow up with them for their subscription upgrade.</p>
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #166534;"><strong>Action Required:</strong> Contact the user to process their upgrade with the LAUNCH10 discount code.</p>
          </div>
        </div>
      `
    };

    // Log the email that would be sent
    console.log('Email to be sent:', emailData);

    return NextResponse.json({ 
      success: true, 
      message: 'Discount request received successfully' 
    });

  } catch (error) {
    console.error('Error processing discount email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
