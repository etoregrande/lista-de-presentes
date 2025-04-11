export const avatarFallbackString = (name: string) => {
    if (!name) return 'NO'

    const splitName: string[] = name.trim().split(' ')

    if (splitName.length > 1) {
        const lastName = splitName.pop() as string

        const firstNameFirstLetter = splitName[0].charAt(0).toUpperCase()
        const lastNameFirstLetter = lastName[0].charAt(0).toUpperCase()

        return `${firstNameFirstLetter}${lastNameFirstLetter}`
    }

    const nameFirstLetter = splitName[0].charAt(0).toUpperCase()
    const nameSecondLetter = splitName[0].charAt(1).toUpperCase()

    return `${nameFirstLetter}${nameSecondLetter}`
}