import React, { useState, useEffect } from "react";
import { HealthQuestionnaire } from "@/entities/HealthQuestionnaire";
import { User } from "@/entities/User";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Camera, CheckCircle2, Heart, FileText, Trash2, Plus, Info } from "lucide-react";

const commonConditions = [
  "Diabetes", "Hypertension", "IBS", "Crohn's Disease", "Ulcerative Colitis", "Diverticulitis",
  "GERD", "Food Allergies", "Celiac Disease", "Lactose Intolerance", "Other"
];

const commonSymptoms = [
  "Bloating", "Gas", "Constipation", "Diarrhea", "Stomach Pain", 
  "Nausea", "Heartburn", "Fatigue", "Brain Fog", "Joint Pain"
];

const tooltips = {
  consent: "We need your consent to collect and process your health data securely. Your information is protected and will only be used for your nutrition coaching.",
  medicalConditions: "Please select all medical conditions you currently have or have been diagnosed with. This helps us create a safe and effective nutrition plan.",
  medications: "List all medications including prescription drugs, over-the-counter medicines, and supplements. Include dosage and frequency so we can account for potential food-drug interactions.",
  symptoms: "Select all symptoms you're currently experiencing. This helps us track improvements and identify patterns in your health journey.",
  healthGoals: "Describe what you want to achieve through nutrition coaching. Be specific - examples: reduce bloating, increase energy, manage IBS symptoms, lose weight sustainably.",
  tonguePhoto: "Traditional health practitioners use tongue appearance to assess overall health. Take a photo in natural light with your tongue extended.",
  stoolPhoto: "The Bristol Stool Chart helps us monitor digestive health. This is optional but provides valuable insights for personalized recommendations.",
  additionalNotes: "Share anything else you think is important for your coach to know - lifestyle factors, stress levels, work schedule, food preferences, etc."
};

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [existingQuestionnaire, setExistingQuestionnaire] = useState(null);
  const [formData, setFormData] = useState({
    medical_conditions: [],
    medications: [],
    allergies: [],
    dietary_restrictions: [],
    health_goals: "",
    current_symptoms: [],
    baseline_tongue_photo_url: "",
    baseline_stool_photo_url: "",
    additional_notes: ""
  });
  const [consentSigned, setConsentSigned] = useState(false);
  const [uploading, setUploading] = useState({ tongue: false, stool: false });
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setConsentSigned(currentUser.consent_signed || false);

        const questionnaires = await HealthQuestionnaire.filter({
          client_id: currentUser.id
        });

        if (questionnaires.length > 0) {
          const questionnaire = questionnaires[0];
          setExistingQuestionnaire(questionnaire);
          setFormData({
            medical_conditions: questionnaire.medical_conditions || [],
            medications: (questionnaire.medications || []).map(med => 
                typeof med === 'string' ? { name: med, dosage: '' } : med
            ),
            allergies: questionnaire.allergies || [],
            dietary_restrictions: questionnaire.dietary_restrictions || [],
            health_goals: questionnaire.health_goals || "",
            current_symptoms: questionnaire.current_symptoms || [],
            baseline_tongue_photo_url: questionnaire.baseline_tongue_photo_url || "",
            baseline_stool_photo_url: questionnaire.baseline_stool_photo_url || "",
            additional_notes: questionnaire.additional_notes || ""
          });
        }
      } catch (error) {
        console.error("Error loading onboarding data:", error);
      }
    };

    loadData();
  }, []);

  const calculateProgress = () => {
    let completed = 0;
    const total = 8; // Total sections to complete

    if (consentSigned) completed++;
    if (formData.medical_conditions.length > 0) completed++;
    if (formData.medications.length > 0) completed++;
    if (formData.current_symptoms.length > 0) completed++;
    if (formData.health_goals.trim()) completed++;
    if (formData.baseline_tongue_photo_url) completed++;
    if (formData.baseline_stool_photo_url) completed++;
    if (formData.additional_notes.trim()) completed++;

    return (completed / total) * 100;
  };

  const sendWelcomeEmail = async () => {
    try {
      setSendingEmail(true);
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Welcome to Neurofocus Nutrition! 🎉",
        from_name: "Neurofocus Nutrition Team",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #5a735a 0%, #485a48 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to Neurofocus Nutrition!</h1>
            </div>
            
            <div style="padding: 30px; background: #f6f7f6; border-radius: 0 0 10px 10px;">
              <h2 style="color: #485a48;">Hi ${user.full_name || 'there'}! 👋</h2>
              
              <p style="color: #333; line-height: 1.6;">
                Thank you for completing your onboarding! We're thrilled to have you join our community 
                and begin your personalized nutrition journey with us.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #485a48; margin-top: 0;">What's Next? 🚀</h3>
                <ul style="color: #333; line-height: 1.8;">
                  <li><strong>Start Your Daily Diary:</strong> Log your meals, energy levels, and symptoms to help us understand your patterns.</li>
                  <li><strong>Review Weekly Goals:</strong> Your coach will set personalized goals each week - check them in your diary.</li>
                  <li><strong>Track Your Progress:</strong> Watch your improvements over time with our progress tracking tools.</li>
                  <li><strong>Connect with Your Coach:</strong> Your coach will review your entries and provide personalized guidance.</li>
                </ul>
              </div>
              
              <div style="background: #e8ebe8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #485a48; margin: 0; font-weight: bold;">💡 Pro Tip:</p>
                <p style="color: #333; margin: 10px 0 0 0;">
                  For best results, aim to complete your daily diary consistently. The more data you log, 
                  the better we can tailor recommendations to your unique needs!
                </p>
              </div>
              
              <p style="color: #333; line-height: 1.6;">
                If you have any questions or need assistance, don't hesitate to reach out. 
                We're here to support you every step of the way!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #485a48; font-weight: bold; margin: 0;">Here's to your health! 🌱</p>
                <p style="color: #7a927a; margin: 5px 0 0 0;">The Neurofocus Nutrition Team</p>
              </div>
            </div>
          </div>
        `
      });
      console.log("Welcome email sent successfully");
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't fail the onboarding if email fails
    } finally {
      setSendingEmail(false);
    }
  };

  const handleArrayFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "" }]
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.medications];
      if (typeof updated[index] === 'string') {
        updated[index] = { name: updated[index], dosage: '' };
      }
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medications: updated };
    });
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file, type) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        [`baseline_${type}_photo_url`]: file_url
      }));
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
    }
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  const handleConsentChange = async (checked) => {
    setConsentSigned(checked);
    if (checked) {
      await User.updateMyUserData({ 
        consent_signed: true 
      });
    }
  };

  const handleSubmit = async () => {
    if (!user || !consentSigned) {
      alert("Please sign the consent form before proceeding.");
      return;
    }

    setSaving(true);
    try {
      const questionnaireData = {
        client_id: user.id,
        ...formData
      };

      let savedQuestionnaire;
      if (existingQuestionnaire) {
        savedQuestionnaire = await HealthQuestionnaire.update(existingQuestionnaire.id, questionnaireData);
      } else {
        savedQuestionnaire = await HealthQuestionnaire.create(questionnaireData);
        setExistingQuestionnaire(savedQuestionnaire);
      }

      const updatedUser = await User.updateMyUserData({ onboarding_completed: true });
      
      // Send welcome email only for new onboarding completions
      if (!user.onboarding_completed) {
        await sendWelcomeEmail();
      }
      
      alert("Onboarding completed successfully! Check your email for next steps.");
      
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert(`Error saving onboarding information: ${error.message || 'Please try again or contact support.'}`);
    }
    setSaving(false);
  };

  if (!user) return null;

  const progress = calculateProgress();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-stone-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress */}
          <Card className="mb-8 border-sage-200 shadow-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-stone-900 mb-2">Welcome to Neurofocus Nutrition</CardTitle>
              <p className="text-stone-600 mb-4">Complete your health profile to get personalized nutrition coaching</p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Onboarding Progress</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-stone-500">
                  {progress === 100 ? "All sections complete! Ready to submit." : "Complete all sections to submit your onboarding."}
                </p>
              </div>

              {user.onboarding_completed && (
                <Badge className="mx-auto mt-4 bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Onboarding Complete
                </Badge>
              )}
            </CardHeader>
          </Card>

          {/* Consent Form */}
          <Card className="mb-8 border-sage-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <FileText className="w-5 h-5" />
                  Consent & Privacy Agreement
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="w-4 h-4 text-sage-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{tooltips.consent}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sage-50 p-4 rounded-xl">
                <h4 className="font-medium text-stone-900 mb-2">By proceeding, you consent to:</h4>
                <ul className="text-sm text-stone-700 space-y-1">
                  <li>• Collection and processing of your health data for nutrition coaching</li>
                  <li>• Secure storage of your information with GDPR compliance</li>
                  <li>• Sharing anonymized data for research purposes (optional)</li>
                  <li>• Photography and documentation of your health journey</li>
                </ul>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={consentSigned}
                  onCheckedChange={handleConsentChange}
                />
                <Label htmlFor="consent" className="text-stone-700">
                  I agree to the terms and provide my consent for data processing
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Health Questionnaire */}
          <Card className="mb-8 border-sage-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-stone-900">Health Information Questionnaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Medical Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-stone-700 font-medium">Medical Conditions</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="w-4 h-4 text-sage-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltips.medicalConditions}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {commonConditions.map(condition => (
                    <Button
                      key={condition}
                      variant={formData.medical_conditions.includes(condition) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleArrayFieldChange('medical_conditions', condition)}
                      className={formData.medical_conditions.includes(condition) 
                        ? "bg-sage-600 hover:bg-sage-700" 
                        : "border-sage-200 text-sage-700 hover:bg-sage-50"
                      }
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-stone-700 font-medium">Current Medications</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="w-4 h-4 text-sage-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltips.medications}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-stone-600 mt-1 mb-3">Please list all medications you are currently taking, including dosage</p>
                
                <div className="space-y-3">
                  {formData.medications.map((medication, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-stone-700 text-sm">Medication Name</Label>
                        <Input
                          placeholder="e.g., Metformin"
                          value={typeof medication === 'string' ? medication : medication.name || ''}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="mt-1 border-sage-200"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-stone-700 text-sm">Dosage & Frequency</Label>
                        <Input
                          placeholder="e.g., 500mg twice daily"
                          value={typeof medication === 'string' ? '' : medication.dosage || ''}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="mt-1 border-sage-200"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    onClick={addMedication}
                    variant="outline"
                    size="sm"
                    className="border-sage-200 text-sage-700 hover:bg-sage-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </div>

              {/* Current Symptoms */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-stone-700 font-medium">Current Symptoms</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="w-4 h-4 text-sage-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltips.symptoms}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {commonSymptoms.map(symptom => (
                    <Button
                      key={symptom}
                      variant={formData.current_symptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleArrayFieldChange('current_symptoms', symptom)}
                      className={formData.current_symptoms.includes(symptom) 
                        ? "bg-sage-600 hover:bg-sage-700" 
                        : "border-sage-200 text-sage-700 hover:bg-sage-50"
                      }
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Health Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-stone-700 font-medium">Primary Health Goals</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="w-4 h-4 text-sage-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltips.healthGoals}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  placeholder="Describe your main health and nutrition goals..."
                  value={formData.health_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, health_goals: e.target.value }))}
                  className="mt-2 border-sage-200 h-24"
                />
              </div>

              {/* Baseline Photos */}
              <div className="space-y-6">
                <h4 className="text-stone-700 font-medium">Baseline Photos</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Tongue Photo */}
                  <Card className="border-sage-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-stone-900">Tongue Photo</CardTitle>
                          <p className="text-sm text-stone-600">For traditional health assessment</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="w-4 h-4 text-sage-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{tooltips.tonguePhoto}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {formData.baseline_tongue_photo_url ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">Photo uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'tongue')}
                            className="hidden"
                            id="tongue-upload"
                          />
                          <label htmlFor="tongue-upload">
                            <Button
                              variant="outline"
                              disabled={uploading.tongue}
                              className="border-sage-200 text-sage-700 hover:bg-sage-50"
                              asChild
                            >
                              <div className="cursor-pointer">
                                {uploading.tongue ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600 mr-2" />
                                ) : (
                                  <Camera className="w-4 h-4 mr-2" />
                                )}
                                {uploading.tongue ? 'Uploading...' : 'Take Photo'}
                              </div>
                            </Button>
                          </label>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Stool Photo */}
                  <Card className="border-sage-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-stone-900">Stool Photo</CardTitle>
                          <p className="text-sm text-stone-600">For digestive health (optional)</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Info className="w-4 h-4 text-sage-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{tooltips.stoolPhoto}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {formData.baseline_stool_photo_url ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">Photo uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'stool')}
                            className="hidden"
                            id="stool-upload"
                          />
                          <label htmlFor="stool-upload">
                            <Button
                              variant="outline"
                              disabled={uploading.stool}
                              className="border-sage-200 text-sage-700 hover:bg-sage-50"
                              asChild
                            >
                              <div className="cursor-pointer">
                                {uploading.stool ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-600 mr-2" />
                                ) : (
                                  <Camera className="w-4 h-4 mr-2" />
                                )}
                                {uploading.stool ? 'Uploading...' : 'Take Photo'}
                              </div>
                            </Button>
                          </label>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-stone-700 font-medium">Additional Notes</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Info className="w-4 h-4 text-sage-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltips.additionalNotes}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  placeholder="Any additional information you'd like your coach to know..."
                  value={formData.additional_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                  className="mt-2 border-sage-200 h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center py-8">
            <Button
              onClick={handleSubmit}
              disabled={!consentSigned || saving || sendingEmail}
              size="lg"
              className="bg-sage-600 hover:bg-sage-700 text-white px-16 py-6 rounded-xl text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              {saving || sendingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  {sendingEmail ? "Sending Welcome Email..." : "Submitting..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 mr-3" />
                  Submit Onboarding
                </>
              )}
            </Button>
            <p className="text-sm text-stone-600 mt-4">
              {!consentSigned && "Please sign the consent form above to continue"}
              {consentSigned && progress < 100 && `Complete ${Math.round((100 - progress) / 12.5)} more section${Math.round((100 - progress) / 12.5) !== 1 ? 's' : ''} to submit`}
              {consentSigned && progress === 100 && "Ready to submit! You'll receive a welcome email after completion."}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}