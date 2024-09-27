export interface UserResponseDTO {
    id: number;
    email: string;
    fullName: string;
    unsignFullName: string | null;
    dob: string;
    phoneNumber: string;
    profilePictureUrl: string | null;
    address: string;
    isActive: boolean;
    loyaltyPoints: number;
    isDeleted: boolean;
    roleName?: string
  }
  
  export interface UserCreateDTO {
    email: string;
    password: string;
    fullName: string;
    dob: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    address: string;
    roleName?: string;
  }
  
  export interface UserUpdateDTO {
    fullName: string;
    dob: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    address: string;
    isActive: boolean;
    roleName?: string;
  }