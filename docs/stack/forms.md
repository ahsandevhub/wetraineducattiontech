# Forms Stack Documentation

## Overview

The platform uses React Hook Form with Zod validation and Shadcn UI form components for consistent, accessible, and performant form handling across all modules.

## Form Architecture

### Core Libraries

- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and TypeScript type inference
- **Shadcn UI**: Consistent form component styling
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Form Component Structure

```tsx
// components/ui/form.tsx
import { createContext, useContext } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const FormContext = createContext<UseFormReturn | null>(null);

export function Form({ children, ...props }: FormProps) {
  return <form {...props}>{children}</form>;
}

export function FormField({ children, ...props }: FormFieldProps) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children, ...props }: LabelProps) {
  return <Label {...props}>{children}</Label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage() {
  // Display validation errors
  return <p className="text-sm text-destructive">{error?.message}</p>;
}
```

## Form Implementation Patterns

### Basic Form Setup

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      // Handle form submission
      console.log("Form data:", data);
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
```

### Advanced Form Features

```tsx
// Form with conditional fields and arrays
const advancedSchema = z
  .object({
    userType: z.enum(["individual", "company"]),
    name: z.string().min(2),
    email: z.string().email(),
    companyName: z.string().optional(),
    employees: z
      .array(
        z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.userType === "company" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for company accounts",
      path: ["companyName"],
    },
  );

export function AdvancedForm() {
  const form = useForm({
    resolver: zodResolver(advancedSchema),
  });

  const userType = form.watch("userType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* User type selection */}
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional company fields */}
        {userType === "company" && (
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Array fields for employees */}
        {userType === "company" && (
          <div>
            <FormLabel>Employees</FormLabel>
            {form.watch("employees")?.map((_, index) => (
              <div key={index} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`employees.${index}.name`}
                  render={({ field }) => (
                    <FormControl>
                      <Input placeholder="Employee name" {...field} />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`employees.${index}.email`}
                  render={({ field }) => (
                    <FormControl>
                      <Input placeholder="Employee email" {...field} />
                    </FormControl>
                  )}
                />
              </div>
            ))}
          </div>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Server Action Integration

### Form Submission with Server Actions

```tsx
// app/actions/createUser.ts
"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["customer", "admin"]),
});

export async function createUser(formData: FormData) {
  const supabase = createClient();

  // Validate form data
  const validatedData = createUserSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  // Check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Create user
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/users");
  return { success: true, data };
}
```

### Client Form with Server Action

```tsx
// components/CreateUserForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser } from "@/app/actions/createUser";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["customer", "admin"]),
});

export function CreateUserForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await createUser(formData);

      if (result.success) {
        toast.success("User created successfully");
        router.push("/users");
      }
    } catch (error) {
      toast.error("Failed to create user");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create User
        </Button>
      </form>
    </Form>
  );
}
```

## Validation Patterns

### Schema Definitions

```typescript
// Common validation schemas
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number");

export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

// Business-specific schemas
export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "proposal", "closed"]),
  source: z.enum(["website", "referral", "social", "advertising", "other"]),
});

export const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});
```

### Custom Validation Rules

```typescript
// Custom validators
export const passwordConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const conditionalSchema = z
  .object({
    hasCompany: z.boolean(),
    companyName: z.string().optional(),
    companySize: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.hasCompany && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required when company is selected",
      path: ["companyName"],
    },
  );
```

## Form Components Library

### Reusable Form Components

```tsx
// components/forms/TextField.tsx
interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function TextField({ name, label, ...props }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// components/forms/SelectField.tsx
interface SelectFieldProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### Form Layout Components

```tsx
// components/forms/FormSection.tsx
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// components/forms/FormGrid.tsx
export function FormGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  columns?: number;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}
```

## Error Handling

### Form-Level Error Handling

```tsx
export function FormWithErrorHandling() {
  const form = useForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    try {
      await submitForm(data);
      toast.success("Form submitted successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach((err) => {
          form.setError(err.path.join("."), {
            message: err.message,
          });
        });
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unexpected error occurred");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Field-Level Validation

```tsx
// Real-time validation
export function RealTimeValidationField() {
  const [isValidating, setIsValidating] = useState(false);

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              {...field}
              onBlur={async () => {
                setIsValidating(true);
                try {
                  // Custom validation (e.g., check if email exists)
                  await validateEmailUniqueness(field.value);
                } catch (error) {
                  form.setError("email", {
                    message: "This email is already registered",
                  });
                } finally {
                  setIsValidating(false);
                }
              }}
            />
          </FormControl>
          {isValidating && (
            <p className="text-sm text-muted-foreground">Checking...</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

## Performance Optimization

### Form Performance Best Practices

```tsx
// Debounced validation
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optimized form component
export function OptimizedForm() {
  const form = useForm();
  const debouncedEmail = useDebounce(form.watch("email"), 300);

  // Only validate email after user stops typing
  useEffect(() => {
    if (debouncedEmail) {
      validateEmail(debouncedEmail);
    }
  }, [debouncedEmail]);

  return <Form {...form}>{/* Form content */}</Form>;
}
```

### Large Form Optimization

```tsx
// Form with lazy loading
export function LargeForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { component: Step1Form },
    { component: Step2Form },
    { component: Step3Form },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div>
      <Form {...form}>
        <CurrentStepComponent />
      </Form>

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

## Testing Forms

### Form Testing Patterns

```typescript
// Form component testing
describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show validation errors for invalid data', async () => {
    render(<LoginForm />);

    // Submit empty form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert validation errors
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});

// Server action testing
describe('createUser', () => {
  it('should create user with valid data', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('role', 'customer');

    const result = await createUser(formData);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject invalid data', async () => {
    const formData = new FormData();
    formData.append('name', ''); // Invalid: empty name
    formData.append('email', 'invalid-email'); // Invalid: bad email
    formData.append('role', 'customer');

    await expect(createUser(formData)).rejects.toThrow();
  });
});
```

## Accessibility

### Form Accessibility Best Practices

```tsx
// Accessible form structure
export function AccessibleForm() {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <fieldset>
          <legend className="sr-only">Personal Information</legend>

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="firstName">First Name</FormLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    aria-describedby="firstName-error"
                    aria-invalid={!!form.formState.errors.firstName}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="firstName-error" />
              </FormItem>
            )}
          />
        </fieldset>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
```

## Form Analytics

### Form Tracking

```tsx
// Form interaction tracking
export function TrackedForm() {
  const form = useForm();

  useEffect(() => {
    // Track form start
    analytics.track("form_start", { form: "contact" });

    const subscription = form.watch((data) => {
      // Track field interactions
      Object.keys(data).forEach((field) => {
        if (data[field] && !form.formState.touchedFields[field]) {
          analytics.track("field_interaction", {
            form: "contact",
            field,
          });
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data) => {
    analytics.track("form_submit", { form: "contact" });
    // Submit logic
  };

  const onError = (errors) => {
    analytics.track("form_error", {
      form: "contact",
      errors: Object.keys(errors),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

This comprehensive forms documentation covers the key patterns, best practices, and implementation details for building robust, accessible, and performant forms across the WeTrainEducation platform.
